"use client";

import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import PopularAuthors from './PopularAuthors';
import TrendingTags from './TrendingTags';
import RecommendedPosts from './RecommendedPosts';
import { BarChart3, Users, Hash, Sparkles } from 'lucide-react';

type TabType = 'leaderboard' | 'authors' | 'tags' | 'recommended';

const TABS = [
  { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: BarChart3 },
  { id: 'authors' as TabType, label: 'Popular Authors', icon: Users },
  { id: 'tags' as TabType, label: 'Trending Tags', icon: Hash },
  { id: 'recommended' as TabType, label: 'For You', icon: Sparkles }
];

export default function DiscoverAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Discover</h1>
        <p className="text-neutral-400">
          Explore trending content, top creators, and personalized recommendations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'authors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PopularAuthors />
            <TrendingTags />
          </div>
        )}
        {activeTab === 'tags' && <TrendingTags />}
        {activeTab === 'recommended' && <RecommendedPosts limit={10} />}
      </div>
    </div>
  );
}
