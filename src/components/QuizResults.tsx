'use client';

import { CheckCircle, XCircle, Trophy, RotateCcw, X } from 'lucide-react';

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  correctAnswer: string;
  options?: string[];
  points: number;
  explanation?: string;
}

interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizResultsProps {
  topic: string;
  score: number;
  totalPoints: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  completedAt: string;
  onRetake?: () => void;
  onClose: () => void;
}

export default function QuizResults({
  topic,
  score,
  totalPoints,
  questions,
  answers,
  completedAt,
  onRetake,
  onClose,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalPoints) * 100);
  
  const getScoreColor = (pct: number) => {
    if (pct >= 90) return 'from-green-500 to-emerald-500';
    if (pct >= 70) return 'from-blue-500 to-cyan-500';
    if (pct >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreMessage = (pct: number) => {
    if (pct >= 90) return '🎉 Outstanding!';
    if (pct >= 70) return '👍 Great job!';
    if (pct >= 50) return '😊 Good effort!';
    return '💪 Keep practicing!';
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-purple-500/30 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Quiz Results</h3>
              <p className="text-sm text-purple-200">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Score Summary */}
      <div className="p-4 md:p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(percentage)} shadow-lg`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{percentage}%</div>
              <div className="text-sm text-white/80">{score}/{totalPoints}</div>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{getScoreMessage(percentage)}</p>
            <p className="text-sm text-white/60 mt-1">
              Completed {new Date(completedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white">Question Breakdown</h4>
          {questions.map((question, index) => {
            const answer = answers.find((a) => a.questionId === question.id);
            const isCorrect = answer?.isCorrect || false;

            return (
              <div
                key={question.id}
                className={`bg-white/5 border rounded-xl p-4 transition-all ${
                  isCorrect
                    ? 'border-green-500/40'
                    : 'border-red-500/40'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg text-white/60 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium leading-relaxed whitespace-pre-wrap">
                      {question.questionText}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        question.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                        question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                        {question.points} pts
                      </span>
                    </div>
                  </div>
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  )}
                </div>

                {/* Answers */}
                <div className="space-y-2 mt-4 pl-11">
                  {/* User Answer */}
                  <div className={`p-3 rounded-lg ${
                    isCorrect
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <p className="text-xs text-white/60 mb-1">Your answer:</p>
                    <p className={`font-medium ${
                      isCorrect ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {answer?.userAnswer || 'No answer'}
                    </p>
                  </div>

                  {/* Correct Answer (if wrong) */}
                  {!isCorrect && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="text-xs text-white/60 mb-1">Correct answer:</p>
                      <p className="font-medium text-green-300">{question.correctAnswer}</p>
                    </div>
                  )}

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-xs text-white/60 mb-1">💡 Explanation:</p>
                      <p className="text-sm text-blue-200">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 border border-purple-400 rounded-lg text-white font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
          >
            <X className="w-4 h-4" />
            Close
            </button>
        </div>
      </div>
    </div>
  );
}
