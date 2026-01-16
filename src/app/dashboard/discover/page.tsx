/**
 * Discover Page
 * Allows users to discover new groups and content
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';

export default function DiscoverPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-neutral-800 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <h1 className="text-3xl font-bold mb-2">Discover</h1>
                <p className="text-neutral-400">Find new communities and teachers to accelerate your learning.</p>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Search */}
                <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search for groups, topics, or teachers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
                    />
                </div>

                {/* Categories / Content Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Recent/Trending Placeholder */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-4">Trending Groups</h3>
                            <div className="text-neutral-500 text-sm">Coming soon...</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                            <h3 className="text-xl font-semibold mb-4">Recommended Teachers</h3>
                            <div className="text-neutral-500 text-sm">Coming soon...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
