import React, { useState } from 'react';
import { Check, Users, X } from 'lucide-react';
import { ChatMessage, Poll } from '@/types/chat';

interface PollMessageProps {
    message: ChatMessage;
    currentUserId: string;
    onVote: (pollId: string, optionIndex: number) => void;
}

export default function PollMessage({ message, currentUserId, onVote }: PollMessageProps) {
    const [showDetails, setShowDetails] = useState<{ text: string; voters: any[] } | null>(null);
    const poll = message.poll;

    if (!poll) return null;

    const totalVotes = poll.votes.length;

    const getOptionVotes = (index: number) => {
        return poll.votes.filter(v => v.optionIndex === index);
    };

    const hasVotedForOption = (index: number) => {
        return poll.votes.some(v => v.userId === currentUserId && v.optionIndex === index);
    };

    return (
        <div className="w-full min-w-[300px] max-w-sm bg-black rounded-xl overflow-hidden border border-zinc-700">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <h2 className="text-base font-bold text-white leading-tight">{poll.question}</h2>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                    {poll.allowMultiple ? 'Select multiple' : 'Select one'}
                </p>
            </div>

            {/* Options List */}
            <div className="p-4 space-y-3">
                {poll.options.map((option, index) => {
                    const votes = getOptionVotes(index);
                    const voteCount = votes.length;
                    const isVoted = hasVotedForOption(index);
                    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                    return (
                        <div key={index} className="relative group">
                            <button
                                onClick={() => onVote(poll.id, index)}
                                className={`w-full text-left relative z-10 p-3 rounded-lg border transition-all flex items-center justify-between ${isVoted
                                        ? 'border-zinc-500 bg-zinc-900/50'
                                        : 'border-zinc-800 hover:border-zinc-700 bg-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3 z-10">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${isVoted ? 'bg-zinc-100 border-zinc-100 text-black' : 'border-zinc-600'
                                        }`}>
                                        {isVoted && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <span className="font-medium text-zinc-200 text-sm">{option}</span>
                                </div>

                                <div className="flex items-center gap-2 z-10">
                                    <span className="text-xs font-semibold text-zinc-500">{percentage}%</span>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDetails({ text: option, voters: votes });
                                        }}
                                        className="p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                                    >
                                        <Users size={14} />
                                    </div>
                                </div>

                                {/* Progress bar background - adjusted opacity/color for dark mode */}
                                <div
                                    className="absolute inset-0 bg-zinc-800/40 rounded-lg transition-all duration-500 z-0"
                                    style={{ width: `${percentage}%` }}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-medium">{totalVotes} votes</span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                    {new Date(poll.createdAt).toLocaleDateString()}
                </span>
            </div>

            {/* Details Modal (Who voted for what) */}
            {showDetails && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black">
                            <div>
                                <h3 className="font-bold text-white text-sm">{showDetails.text}</h3>
                                <p className="text-xs text-zinc-500">{showDetails.voters.length} votes</p>
                            </div>
                            <button
                                onClick={() => setShowDetails(null)}
                                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800">
                            {showDetails.voters.length > 0 ? (
                                showDetails.voters.map((vote) => (
                                    <div key={vote.id} className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors">
                                        <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center font-bold text-xs text-zinc-300">
                                            {vote.user?.displayName ? vote.user.displayName.substring(0, 2).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-zinc-200">{vote.user?.displayName || 'Unknown User'}</p>
                                            <p className="text-[10px] text-zinc-600">{new Date(vote.votedAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-zinc-600 text-sm">
                                    No votes yet for this option.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
