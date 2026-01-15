'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Calendar } from 'lucide-react';
import { createPoll } from '@/lib/pollApi';
import { messagesAPI } from '@/lib/messages';
import { getAuthToken } from '@/lib/api';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentUserId: string;
  onPollCreated?: () => void;
}

export default function CreatePollModal({
  isOpen,
  onClose,
  conversationId,
  currentUserId,
  onPollCreated,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    setError(null);

    // Validation
    if (!question.trim()) {
      setError('Please enter a poll question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please add at least 2 options');
      return;
    }

    setIsCreating(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Step 1: Create a message with the poll question
      const message = await messagesAPI.sendMessage(token, {
        conversationId,
        userId: currentUserId,
        content: `📊 ${question.trim()}`,
      });

      // Step 2: Create the poll attached to the message
      const expiresAt = hasExpiry
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      await createPoll(
        message.id,
        question.trim(),
        validOptions,
        allowMultiple,
        expiresAt
      );

      handleReset();
      onClose();
      onPollCreated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setOptions(['', '']);
    setAllowMultiple(false);
    setHasExpiry(false);
    setExpiryDays(7);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">Create Poll</h2>
            <p className="text-sm text-zinc-400 mt-1">Ask your group a question</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Poll Question *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's your question?"
              maxLength={200}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-zinc-600 mt-1">{question.length}/200</p>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Poll Options * (2-10)
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                    className="flex-1 px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={16} />
                Add Option
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-300">Poll Settings</h3>
            
            {/* Allow Multiple */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-400">Allow multiple answers</span>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
              />
            </label>

            {/* Expiry */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-zinc-400">Set expiration date</span>
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
              />
            </label>

            {hasExpiry && (
              <div className="flex items-center gap-3 pl-4">
                <Calendar size={16} className="text-zinc-500" />
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="30"
                  className="w-20 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm text-zinc-400">days</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
