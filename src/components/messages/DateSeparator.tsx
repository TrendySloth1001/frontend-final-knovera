'use client';

interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {formatDate(date)}
        </span>
      </div>
    </div>
  );
}
