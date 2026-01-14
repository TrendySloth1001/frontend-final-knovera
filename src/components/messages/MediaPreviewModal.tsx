import React, { useState, useRef, useEffect } from 'react';
import { Image, X, Paperclip, Send, Smile, FileText, Film, MoreHorizontal } from 'lucide-react';

interface Attachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'file';
  size: string;
  file: File;
}

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (caption: string, files: File[]) => void;
  initialFile?: File | null;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ isOpen, onClose, onSend, initialFile }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with the passed file if present
  useEffect(() => {
    if (isOpen && initialFile) {
      processFiles([initialFile]);
    } else if (!isOpen) {
      // Cleanup on close
      setAttachments([]);
      setMessage('');
    }
  }, [isOpen, initialFile]);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file), // Note: We should revoke these URLS on unmount/remove
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
      size: (file.size / 1024).toFixed(1) + ' KB',
      file: file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleSendClick = () => {
    const filesToSend = attachments.map(a => a.file);
    onSend(message, filesToSend);
    setMessage('');
    setAttachments([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 font-sans text-white backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay Backdrop Click to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-xl border border-white/20 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] z-10"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black">
          <h2 className="text-sm uppercase tracking-widest font-bold text-white">Composer</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Composer Body */}
        <div
          className={`p-6 transition-colors ${isDragging ? 'bg-white/5' : 'bg-transparent'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Media Preview Gallery */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 transition-all animate-in fade-in zoom-in-95">
              {attachments.map((file) => (
                <div key={file.id} className="relative group aspect-square rounded-lg overflow-hidden bg-black border border-white/20">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt="preview"
                      className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-500"
                    />
                  ) : file.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                      <Film className="text-white/60" size={32} />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-900">
                      <FileText className="text-white/40 mb-2" size={32} />
                      <span className="text-[10px] uppercase tracking-tighter text-white/60 truncate w-full px-2">{file.name}</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeAttachment(file.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black text-white border border-white/20 rounded-full transition-all opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add more button in grid */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 hover:border-white hover:text-white transition-all bg-white/5"
              >
                <Paperclip size={20} className="mb-1" />
                <span className="text-[10px] uppercase font-bold">Attach</span>
              </button>
            </div>
          )}

          {/* Textfield Component */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Write something..."
              className="w-full bg-transparent text-white text-xl font-light resize-none focus:outline-none placeholder:text-white/20 min-h-[60px] py-2 leading-relaxed"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Footer / Toolbar */}
        <div className="px-6 py-4 bg-black border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf"
            />
            <ToolbarButton
              icon={<Image size={18} />}
              onClick={() => fileInputRef.current?.click()}
            />
            {/* These buttons are visual only for now as per snippet, or could trigger specific pickers */}
            <ToolbarButton
              icon={<Film size={18} />}
              onClick={() => fileInputRef.current?.click()}
            />
            <ToolbarButton
              icon={<Smile size={18} />}
            />
          </div>

          <div className="flex items-center gap-6">
            <span className={`text-[10px] font-mono ${message.length > 240 ? 'text-white' : 'text-white/30'}`}>
              {message.length.toString().padStart(3, '0')} / 280
            </span>
            <button
              onClick={handleSendClick}
              disabled={!message.trim() && attachments.length === 0}
              className={`flex items-center gap-3 px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all
                ${(!message.trim() && attachments.length === 0)
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  : 'bg-white text-black hover:bg-white/90 active:scale-95 border border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <p className="mt-8 text-white/20 text-[10px] tracking-[0.3em] uppercase">
        Monochrome UI v1.0
      </p>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-2.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
  >
    {icon}
  </button>
);

export default MediaPreviewModal;
