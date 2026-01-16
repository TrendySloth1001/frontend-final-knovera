import { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';
import DocumentViewer from './DocumentViewer';
import { FileText, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface MediaGridProps {
  mediaUrls: string[];
  mediaTypes: string[];
}

export default function MediaGrid({ mediaUrls, mediaTypes }: MediaGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  const count = mediaUrls.length;

  // Determine container grid class
  const getGridContainerClass = () => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2 grid-rows-2';
    if (count === 4) return 'grid-cols-2 grid-rows-2';
    if (count === 5) return 'grid-cols-6 grid-rows-2'; // Special 6-col grid for 2-on-top, 3-on-bottom
    return 'grid-cols-3 grid-rows-2'; // 6+ items (3x2)
  };

  // Determine individual item span class
  const getItemClass = (index: number) => {
    if (count === 1) return '';
    if (count === 2) return 'aspect-[4/5]'; // Tall split

    if (count === 3) {
      // Index 0: Row 1, Full Width (Col Span 2)
      // Index 1, 2: Row 2, Half Width (Col Span 1)
      if (index === 0) return 'col-span-2 row-span-1';
      return 'col-span-1 row-span-1';
    }

    if (count === 4) return ''; // 2x2 standard

    if (count === 5) {
      // Row 1: 2 items (Span 3 each in 6-col grid)
      // Row 2: 3 items (Span 2 each in 6-col grid)
      if (index < 2) return 'col-span-3';
      return 'col-span-2';
    }

    // 6+ items: Standard 3-col grid
    return '';
  };

  const renderMedia = (url: string, type: string, index: number, inLightbox = false) => {
    // Validate URL
    try {
      const urlObj = new URL(url, window.location.origin);
      const isValidUrl = urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || urlObj.protocol === 'blob:';
      if (!isValidUrl) return null;
    } catch (error) {
      return null;
    }

    if (type?.startsWith('image/')) {
      return (
        <img
          src={url}
          alt={`Media ${index + 1}`}
          className={inLightbox ? 'max-w-full max-h-[85vh] object-contain rounded shadow-2xl' : 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'}
          onClick={() => !inLightbox && openLightbox(index)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    } else if (type?.startsWith('video/')) {
      return (
        <VideoPlayer
          src={url}
          className={inLightbox ? 'max-w-full max-h-full' : 'w-full h-full object-cover'}
        />
      );
    } else if (type?.startsWith('audio/')) {
      return <AudioPlayer src={url} />;
    } else if (type?.startsWith('application/')) {
      if (inLightbox) {
        return <DocumentViewer src={url} />;
      }
      return (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
          <DocumentViewer src={url} />
        </div>
      )
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors w-full h-full"
      >
        <FileText size={24} />
        <span className="text-sm">View File</span>
      </a>
    );
  };

  // If single media, render normally
  if (count === 1) {
    return (
      <>
        <div className="rounded-lg overflow-hidden bg-zinc-900 max-w-sm">
          {renderMedia(mediaUrls[0], mediaTypes[0], 0)}
        </div>
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={closeLightbox}
          >
            <button className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors">
              <X size={28} />
            </button>
            <div onClick={e => e.stopPropagation()}>
              {renderMedia(mediaUrls[0], mediaTypes[0], 0, true)}
            </div>
          </div>
        )}
      </>
    );
  }

  // Multiple media: Use 5:7 aspect ratio box with tailored grids
  return (
    <>
      <div
        className="relative w-full shadow-lg rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50"
        style={{ aspectRatio: '4 / 5', width: '100%', maxWidth: '320px' }} // Changed to 4:5 as it often fits chat bubbles better than 5:7, but 5:7 is fine too. Let's stick to user request 5:7 or roughly that.
      >
        {/* Note: User asked for 5:7. Let's use 5/7 explicitly if they asked, or just a good vertical ratio. 5/7 is ~0.71. 4/5 is 0.8. */}
        <div className={`grid h-full w-full gap-0.5 ${getGridContainerClass()}`} style={{ aspectRatio: '5/7' }}>
          {mediaUrls.map((url, index) => {
            // For 6+ items, limit to 6 slots (last one has overlay)
            if (count > 6 && index >= 6) return null;

            return (
              <div
                key={index}
                className={`relative group cursor-pointer overflow-hidden bg-zinc-800 ${getItemClass(index)}`}
                onClick={() => openLightbox(index)}
              >
                {renderMedia(url, mediaTypes[index], index)}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <Maximize2 size={20} className="text-white drop-shadow-md" />
                </div>

                {/* +N Overlay for the last visible item if there are more */}
                {count > 6 && index === 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold">
                    +{count - 6}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <button className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50">
            <X size={28} />
          </button>

          <button
            className="absolute left-4 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
            onClick={prevImage}
          >
            <ChevronLeft size={32} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {renderMedia(mediaUrls[lightboxIndex], mediaTypes[lightboxIndex], lightboxIndex, true)}
          </div>

          <button
            className="absolute right-4 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
            onClick={nextImage}
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-50">
            {mediaUrls.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${index === lightboxIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
