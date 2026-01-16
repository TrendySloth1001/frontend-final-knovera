import { X, Clock } from 'lucide-react';

interface EditHistoryModalProps {
  current: string;
  history: Array<{ content: string; editedAt: string }>;
  onClose: () => void;
}

export default function EditHistoryModal({
  current,
  history,
  onClose,
}: EditHistoryModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    if (isToday) {
      return `Today at ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday at ${timeStr}`;
    } else {
      return `${date.toLocaleDateString()} at ${timeStr}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-2xl max-h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-zinc-400" />
            <h2 className="text-lg font-semibold text-white">Edit History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* History timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Current version */}
            <div className="relative pl-6 pb-4 border-l-2 border-blue-500">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-zinc-900" />
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                  Current
                </span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-lg">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{current}</p>
              </div>
            </div>

            {/* Previous versions */}
            {history.map((edit, index) => (
              <div
                key={index}
                className="relative pl-6 pb-4 border-l-2 border-zinc-700"
              >
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-zinc-700 border-2 border-zinc-900" />
                <div className="mb-2 text-xs text-zinc-500">
                  {formatDate(edit.editedAt)}
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg">
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">{edit.content}</p>
                </div>
              </div>
            ))}

            {/* Original message indicator */}
            {history.length > 0 && (
              <div className="relative pl-6">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-zinc-700 border-2 border-zinc-900" />
                <div className="text-xs text-zinc-500">
                  Original message
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
