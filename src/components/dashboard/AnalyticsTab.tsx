import { ArrowLeft, BarChart3 } from 'lucide-react';

interface AnalyticsTabProps {
  changeTab: (tab: string) => void;
}

export default function AnalyticsTab({ changeTab }: AnalyticsTabProps) {
  return (
    <>
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => changeTab('Overview')}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-semibold">Analytics</h3>
      </div>

      <div className="text-center py-12 flex flex-col items-center justify-center">
        <BarChart3 size={48} className="text-neutral-600 mb-4" />
        <p className="text-neutral-500 text-sm">Analytics coming soon</p>
      </div>
    </>
  );
}
