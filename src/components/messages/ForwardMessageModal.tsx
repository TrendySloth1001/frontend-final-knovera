import { useState } from 'react';
import { ChatConversation, ChatMessage } from '@/types/chat';
import { X, Send, Check } from 'lucide-react';

interface ForwardMessageModalProps {
  message: ChatMessage;
  conversations: ChatConversation[];
  currentUserId: string;
  onForward: (conversationIds: string[]) => void;
  onClose: () => void;
}

export default function ForwardMessageModal({
  message,
  conversations,
  currentUserId,
  onForward,
  onClose,
}: ForwardMessageModalProps) {
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isForwarding, setIsForwarding] = useState(false);

  // Filter out the current conversation
  const availableConversations = conversations.filter(
    (conv) => conv.id !== message.conversationId
  );

  const toggleConversation = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleForward = async () => {
    if (selectedConversations.size === 0) return;
    
    setIsForwarding(true);
    try {
      await onForward(Array.from(selectedConversations));
      onClose();
    } catch (error) {
      console.error('Failed to forward message:', error);
      setIsForwarding(false);
    }
  };

  const getConversationName = (conv: ChatConversation) => {
    if (conv.isGroup) {
      return conv.name || 'Unnamed Group';
    }
    const otherMember = conv.members.find((m) => m.userId !== currentUserId);
    return otherMember?.user.displayName || 'Unknown User';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-md max-h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Forward Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Message preview */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950">
          <div className="text-sm text-zinc-400 mb-1">Message</div>
          <div className="bg-zinc-900 p-3 rounded-lg">
            <p className="text-sm text-zinc-300 line-clamp-3">{message.content}</p>
            {(message.mediaUrl || (message.mediaUrls && message.mediaUrls.length > 0)) && (
              <div className="mt-2 text-xs text-zinc-500">
                📎 {message.mediaUrls?.length || 1} attachment(s)
              </div>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2">
          {availableConversations.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No conversations available
            </div>
          ) : (
            availableConversations.map((conv) => {
              const isSelected = selectedConversations.has(conv.id);
              const conversationName = getConversationName(conv);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => toggleConversation(conv.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1
                    ${isSelected ? 'bg-blue-500/20 border border-blue-500/50' : 'hover:bg-zinc-800 border border-transparent'}
                  `}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    {conv.avatarUrl ? (
                      <img src={conv.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-zinc-400">
                        {conversationName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm text-white truncate">
                      {conversationName}
                    </div>
                    {conv.isGroup && (
                      <div className="text-xs text-zinc-500">
                        {conv.members.length} members
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            {selectedConversations.size} selected
          </div>
          <button
            onClick={handleForward}
            disabled={selectedConversations.size === 0 || isForwarding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-colors font-medium"
          >
            <Send size={16} />
            <span>{isForwarding ? 'Forwarding...' : 'Forward'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
