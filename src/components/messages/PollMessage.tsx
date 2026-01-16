import React, { useState } from 'react';
import { Check, Users, X, Info, ChevronRight } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

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

    // Transform data to match the UI needs
    const optionsWithData = poll.options.map((optionText, index) => {
        const optionVotes = poll.votes.filter(v => v.optionIndex === index);
        const isVoted = optionVotes.some(v => v.userId === currentUserId);
        return {
            index,
            text: optionText,
            voters: optionVotes,
            voteCount: optionVotes.length,
            isVoted
        };
    });

    return (
        <div className="w-full min-w-[320px] max-w-md bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">

            {/* Header Section */}
            <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-white leading-tight tracking-tight">
                        {poll.question}
                    </h2>
                    <div className="p-2 bg-zinc-800 rounded-full text-zinc-400">
                        <Info size={16} />
                    </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">
                    {poll.allowMultiple ? 'Select multiple' : 'Select one'}
                </p>
            </div>

            {/* Options Container */}
            <div className="px-5 pb-5 space-y-3">
                {optionsWithData.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0;

                    return (
                        <div key={option.index} className="relative">
                            <button
                                onClick={() => onVote(poll.id, option.index)}
                                className={`w-full text-left relative z-10 p-3.5 rounded-xl border transition-all duration-300 active:scale-[0.98] flex items-center justify-between group overflow-hidden ${option.isVoted
                                        ? 'border-white bg-white/5'
                                        : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3 relative z-20 max-w-[50%]">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${option.isVoted
                                            ? 'bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                            : 'border-zinc-700 group-hover:border-zinc-500'
                                        }`}>
                                        {option.isVoted && <Check size={12} className="text-black" strokeWidth={3} />}
                                    </div>
                                    <span className={`text-[14px] font-semibold transition-colors truncate ${option.isVoted ? 'text-white' : 'text-zinc-300'
                                        }`}>
                                        {option.text}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 relative z-20">
                                    {/* Facepile */}
                                    <div className="flex -space-x-2 overflow-hidden items-center">
                                        {option.voters.slice(0, 3).map((v, i) => (
                                            <div
                                                key={v.id || i} // Fallback to index if vote id logic fails, but v.id should exist
                                                className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
                                            >
                                                {v.user.avatarUrl ? (
                                                    <img src={v.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    v.user.displayName?.charAt(0) || 'U'
                                                )}
                                            </div>
                                        ))}
                                        {option.voteCount > 3 && (
                                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-zinc-900 bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 font-bold">
                                                +{option.voteCount - 3}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end min-w-[32px]">
                                        <span className={`text-sm font-bold ${option.isVoted ? 'text-white' : 'text-zinc-500'}`}>
                                            {percentage}%
                                        </span>
                                    </div>

                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDetails({ text: option.text, voters: option.voters });
                                        }}
                                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </div>
                                </div>

                                {/* Progressive Background */}
                                <div
                                    className={`absolute inset-0 bg-white/[0.04] transition-all duration-1000 ease-out z-0`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Footer Summary */}
            <div className="px-5 py-4 bg-zinc-800/30 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Users size={14} />
                    <span className="text-xs font-semibold">{totalVotes} Total Votes</span>
                </div>
                <div className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
                    Public
                </div>
            </div>

            {/* Modern Backdrop Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowDetails(null)}
                    />
                    <div className="bg-zinc-900 w-full max-w-md relative z-10 rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 sm:hidden" />

                        <div className="p-6 pb-4 flex justify-between items-center border-b border-zinc-800/50">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Voters for</p>
                                <h3 className="text-lg font-bold text-white max-w-[200px] truncate">{showDetails.text}</h3>
                            </div>
                            <button
                                onClick={() => setShowDetails(null)}
                                className="w-10 h-10 bg-zinc-800 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto px-4 pb-8 pt-2">
                            {showDetails.voters.length > 0 ? (
                                <div className="space-y-1">
                                    {showDetails.voters.map((vote) => (
                                        <div key={vote.id} className="flex items-center gap-4 p-3 hover:bg-zinc-800/50 rounded-2xl transition-colors">
                                            <div className="w-11 h-11 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border border-zinc-700">
                                                {vote.user.avatarUrl ? (
                                                    <img src={vote.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-400 font-bold text-lg">{vote.user.displayName?.charAt(0) || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-zinc-200 truncate">{vote.user.displayName || 'Unknown'}</p>
                                                <p className="text-xs text-zinc-500 font-medium tracking-tight">
                                                    {new Date(vote.votedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ID: {vote.user.id.slice(0, 4)}
                                                </p>
                                            </div>
                                            {/* Optional: Show check for user themselves or if we want to confirm everyone voted */}
                                            {/* <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Check size={14} strokeWidth={3} />
                                            </div> */}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-zinc-600">
                                    <Users size={40} className="mb-4 opacity-50" />
                                    <p className="text-sm font-medium">No one has voted for this yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
