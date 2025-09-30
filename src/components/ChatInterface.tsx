'use client';

import { useState, useRef, useEffect } from 'react';

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">AI Management Coach</h2>
          <p className="text-sm text-text-secondary">
            Ask questions about management challenges
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={startNewConversation}
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            New Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white rounded-2xl p-6 shadow-sm">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
            <p className="text-text-secondary">
              Ask me anything about management, leadership, or team dynamics.
            </p>
            <div className="mt-8 grid gap-4 max-w-2xl mx-auto">
              <button
                onClick={() =>
                  setInput('How do I give constructive feedback to my team?')
                }
                className="p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                className="p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                className="p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-accent-yellow text-text-primary'
                      : 'bg-gray-100 text-text-primary'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-4">
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

      {/* Rate Limit Info */}
      <p className="text-xs text-text-secondary text-center mt-2">
        Rate limit: 10 messages per minute
      </p>
    </div>
  );
}