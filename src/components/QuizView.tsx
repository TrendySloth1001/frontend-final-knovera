'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  options?: string[];
  points: number;
}

interface QuizViewProps {
  quizSessionId: string;
  topic: string;
  questions: QuizQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  onClose: () => void;
}

export default function QuizView({ quizSessionId, topic, questions, onSubmit, onClose }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate questions array
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">No questions available</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(answers);
    setIsSubmitting(false);
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;
  const canSubmit = Object.keys(answers).length === questions.length;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Quiz: {topic}</h3>
            <p className="text-sm text-purple-200">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Question */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-300 font-bold text-sm flex-shrink-0">
              {currentIndex + 1}
            </span>
            <div className="flex-1">
              <p className="text-white font-medium leading-relaxed whitespace-pre-wrap">
                {currentQuestion.questionText}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                  {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                </span>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-2">
            {currentQuestion.questionType === 'mcq' || currentQuestion.questionType === 'true-false' ? (
              currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'bg-purple-500 text-white border-2 border-purple-400'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border-2 border-transparent'
                  }`}
                >
                  <span className="mr-3 opacity-60">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))
            ) : (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-center text-white/60 text-sm">
            {Object.keys(answers).length} / {questions.length} answered
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 border border-purple-400 rounded-lg text-white font-medium transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 border border-green-400 disabled:border-gray-500 rounded-lg text-white font-bold transition-all disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
