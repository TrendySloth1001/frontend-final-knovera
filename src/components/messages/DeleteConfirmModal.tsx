'use client';

import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeletingConversation: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeletingConversation,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-sm pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Delete Conversation?</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              This action cannot be undone. All messages and media in this conversation will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-800 hover:text-white transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeletingConversation}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg shadow-red-900/20"
              >
                {isDeletingConversation ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
