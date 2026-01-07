'use client';

import { useState } from 'react';
import { Brain, X } from 'lucide-react';

interface QuizGeneratorProps {
  conversationId: string;
  token: string;
  onQuizGenerated: (quizSessionId: string) => void;
}

export default function QuizGenerator({ conversationId, token, onQuizGenerated }: QuizGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['mcq', 'true-false']);
  const [difficulty, setDifficulty] = useState('auto');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError('');

      const response = await fetch(
        `http://localhost:3001/api/conversations/${conversationId}/generate-quiz`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionCount,
            questionTypes,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      console.log('Quiz generation response:', data);

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to generate quiz');
      }

      setIsOpen(false);
      onQuizGenerated(data.data.quizSessionId);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionType = (type: string) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg transition-all text-purple-300 text-sm font-medium"
        title="Generate Quiz"
      >
        <Brain className="w-4 h-4" />
        <span className="hidden md:inline">Generate Quiz</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Generate Quiz</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Number of Questions
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        questionCount === count
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Question Types
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'mcq', label: 'Multiple Choice' },
                    { value: 'true-false', label: 'True/False' },
                    { value: 'short-answer', label: 'Short Answer' },
                  ].map(type => (
                    <label
                      key={type.value}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={questionTypes.includes(type.value)}
                        onChange={() => toggleQuestionType(type.value)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-white">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['auto', 'easy', 'medium', 'hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                        difficulty === diff
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Analyzing conversation...
                  </span>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
