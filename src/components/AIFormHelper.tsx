/**
 * AI Form Helper Component
 * Provides authless AI assistance for form fields (rate limited: 10 req/hour)
 */

'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '@/lib/ai-api';

interface AIFormHelperProps {
  fieldType: 'bio' | 'description' | 'interests' | 'specialization';
  context?: string;
  maxLength?: number;
  onSuggestion: (suggestion: string) => void;
  label?: string;
}

export function AIFormHelper({
  fieldType,
  context,
  maxLength,
  onSuggestion,
  label = 'Get AI help',
}: AIFormHelperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiAPI.helpFormField({
        fieldType,
        context,
        maxLength,
      });

      if (response.success) {
        onSuggestion(response.data.suggestion);
      } else {
        setError(response.message || 'Failed to get suggestion');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI help';
      
      // Check for rate limit error
      if (errorMessage.includes('Too many requests') || errorMessage.includes('429')) {
        setError('Rate limit reached (10 requests/hour). Please try again later.');
      } else if (errorMessage.includes('Ollama') || errorMessage.includes('connect')) {
        setError('AI service temporarily unavailable. Please try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGetSuggestion}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Getting suggestion...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3 h-3" />
            <span>{label}</span>
          </>
        )}
      </button>
      
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
