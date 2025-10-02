'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownMessage from './MarkdownMessage';
import ConversationSidebar from './ConversationSidebar';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type ChatInterfaceProps = {
  userId: string;
};

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationsKey, setConversationsKey] = useState(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation messages when conversation is selected
  const loadConversation = async (convId: string) => {
    try {
      const supabase = (await import('@/lib/supabase-client')).createBrowserSupabaseClient();
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(msgs || []);
      setConversationId(convId);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const handleSelectConversation = (convId: string | null) => {
    if (convId) {
      loadConversation(convId);
    } else {
      // New chat
      setMessages([]);
      setConversationId(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let tempAssistantMsg: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempAssistantMsg]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.text) {
                  assistantMessage += data.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === tempAssistantMsg.id
                        ? { ...msg, content: assistantMessage }
                        : msg
                    )
                  );
                }

                if (data.done && data.conversationId) {
                  setConversationId(data.conversationId);
                  // Refresh conversations list
                  setConversationsKey(prev => prev + 1);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      // Remove the temporary user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        key={conversationsKey}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                <p className="text-text-secondary mb-8">
                  Ask me anything about management, leadership, or team dynamics.
                </p>
                <div className="grid gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() =>
                      setInput('How do I give constructive feedback to my team?')
                    }
                    className="p-4 text-left bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <p className="font-medium">💬 Giving Feedback</p>
                    <p className="text-sm text-text-secondary">
                      How do I give constructive feedback to my team?
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setInput('What are the key principles of effective delegation?')
                    }
                    className="p-4 text-left bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <p className="font-medium">🎯 Delegation</p>
                    <p className="text-sm text-text-secondary">
                      What are the key principles of effective delegation?
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setInput('How can I build trust with my team?')
                    }
                    className="p-4 text-left bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <p className="font-medium">🤝 Building Trust</p>
                    <p className="text-sm text-text-secondary">
                      How can I build trust with my team?
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MarkdownMessage
                    key={msg.id}
                    content={msg.content}
                    role={msg.role}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-2">
            <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your management coach..."
              disabled={isLoading}
              className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-yellow focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-accent-yellow text-text-primary font-semibold rounded-xl hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}