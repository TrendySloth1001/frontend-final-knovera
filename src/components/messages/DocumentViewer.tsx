import React, { useState } from 'react';
import {
    FileText,
    X,
    Maximize2,
    Download,
    ExternalLink
} from 'lucide-react';

interface DocumentViewerProps {
    src: string;
    fileName?: string;
    className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    src,
    fileName,
    className = ""
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const name = fileName || src.split('/').pop()?.split('?')[0] || 'Document';

    // Preview Mode
    if (!isExpanded) {
        return (
            <div className={`flex items-center justify-start ${className}`}>
                <button
                    onClick={() => setIsExpanded(true)}
                    className="group relative flex items-center gap-3 bg-slate-900 border border-white/10 p-2 pr-4 rounded-3xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 max-w-[300px]"
                >
                    {/* Icon Bubble */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-2xl bg-zinc-800 border border-white/5 shrink-0 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                        <FileText size={24} className="text-blue-400 drop-shadow-lg" />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">Document</span>
                        <span className="text-white text-sm font-semibold leading-tight truncate w-full" title={name}>{name}</span>
                        <span className="text-slate-400 text-[10px] mt-0.5 font-medium truncate w-full">Click to view</span>
                    </div>

                    <div className="absolute -top-1.5 -right-1.5 bg-blue-600 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                        <Maximize2 size={10} className="text-white" />
                    </div>
                </button>
            </div>
        );
    }

    // Expanded Overlay Mode
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl h-[80vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/95 backdrop-blur z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                            <FileText size={16} />
                        </div>
                        <h3 className="text-white font-medium text-sm truncate">{name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={src}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Download"
                        >
                            <Download size={18} />
                        </a>
                        <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                            title="Open in new tab"
                        >
                            <ExternalLink size={18} />
                        </a>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/20 transition-all border border-transparent"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full h-full bg-white">
                    <iframe
                        src={src}
                        className="w-full h-full border-none"
                        title={name}
                    />
                </div>

            </div>
        </div>
    );
};

export default DocumentViewer;
