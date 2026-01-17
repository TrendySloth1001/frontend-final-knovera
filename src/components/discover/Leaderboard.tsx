"use client";

import React, { useState, useEffect } from 'react';
import { discoverApi, LeaderboardEntry } from '@/lib/discoverApi';
import { Trophy, TrendingUp, MessageSquare, ThumbsUp, Award } from 'lucide-react';

type MetricType = 'posts' | 'votes' | 'comments' | 'engagement';
type TimeframeType = 'day' | 'week' | 'month' | 'all';

const METRIC_CONFIG = {
  posts: { icon: TrendingUp, label: 'Top Posters', color: 'blue' },
  votes: { icon: ThumbsUp, label: 'Most Upvoted', color: 'orange' },
  comments: { icon: MessageSquare, label: 'Top Commenters', color: 'green' },
  engagement: { icon: Award, label: 'Most Active', color: 'purple' }
};

const TIMEFRAME_LABELS = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time'
};

export default function Leaderboard() {
  const [metric, setMetric] = useState<MetricType>('engagement');
  const [timeframe, setTimeframe] = useState<TimeframeType>('week');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [metric, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await discoverApi.getLeaderboard(metric, timeframe, 10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const config = METRIC_CONFIG[metric];
  const Icon = config.icon;

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-neutral-500';
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`w-5 h-5 ${getRankColor(rank)}`} />;
    }
    return <span className="text-neutral-500 font-bold text-sm">#{rank}</span>;
  };

  return (
    <div className="bg-black border border-neutral-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon className={`w-6 h-6 text-${config.color}-500`} />
          <h2 className="text-xl font-bold text-white">{config.label}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {/* Metric Selector */}
        <div className="flex gap-1 bg-neutral-900 rounded-lg p-1">
          {(Object.keys(METRIC_CONFIG) as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                metric === m
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {METRIC_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1 bg-neutral-900 rounded-lg p-1">
          {(Object.keys(TIMEFRAME_LABELS) as TimeframeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeframe === t
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {TIMEFRAME_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No data available for this period
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.user.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r from-neutral-900 to-transparent border border-neutral-800'
                  : 'bg-neutral-900/50 hover:bg-neutral-900'
              }`}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center">
                {getRankBadge(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                {entry.user.avatarUrl ? (
                  <img
                    src={entry.user.avatarUrl}
                    alt={entry.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {entry.user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">
                  {entry.user.displayName}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className={`text-2xl font-black text-${config.color}-500`}>
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-500 font-medium">
                  {entry.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
