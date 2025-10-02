'use client';

import { useState, useEffect } from 'react';

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
  message_count: number;
};

type ConversationSidebarProps = {
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  onConversationsChange?: () => void;
};

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onConversationsChange,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh conversations when external changes occur
  useEffect(() => {
    if (onConversationsChange) {
      fetchConversations();
    }
  }, [onConversationsChange]);

  const handleNewChat = () => {
    onSelectConversation(null);
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from list
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        // If deleting current conversation, start new chat
        if (id === currentConversationId) {
          onSelectConversation(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white h-full flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8 text-small">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-small">
            No conversations yet.<br />Start a new chat!
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`
                group relative p-3 rounded-lg cursor-pointer transition-all
                ${conv.id === currentConversationId 
                  ? 'bg-accent-yellow/20 shadow-sm' 
                  : 'hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-small truncate">
                    {conv.title || 'New Conversation'}
                  </h3>
                  <p className="text-tiny text-text-secondary mt-1">
                    {formatDate(conv.updated_at)}
                  </p>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}