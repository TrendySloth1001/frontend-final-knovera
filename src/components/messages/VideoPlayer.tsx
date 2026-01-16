import React, { useState, useRef, useEffect } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    Maximize,
    ExternalLink,
    X,
    Maximize2,
    Download
} from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
    className = ""
}) => {
    // --- State ---
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [volume, setVolume] = useState<number>(1);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [showControls, setShowControls] = useState<boolean>(true);

    // --- Refs ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Helpers ---
    const formatTime = (time: number): string => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    };

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
        resetControlsTimeout();
    };

    const handleScrub = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        let clientX = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        const x = clientX - rect.left;
        const clickedPercentage = Math.max(0, Math.min(1, x / rect.width));
        videoRef.current.currentTime = clickedPercentage * duration;
        resetControlsTimeout();
    };

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setShowControls(false);
            }
        }, 3000);
    };

    const closePlayer = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // --- Effects ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isExpanded) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onLoadedMetadata = () => setDuration(video.duration);

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [isExpanded]);

    // Initial WhatsApp-style Preview Button View
    if (!isExpanded) {
        return (
            <div className={`flex items-center justify-start ${className}`}>
                <button
                    onClick={() => setIsExpanded(true)}
                    className="group relative flex items-center gap-3 bg-slate-900 border border-white/10 p-2 pr-4 rounded-3xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 max-w-[300px]"
                >
                    {/* Live Preview Bubble */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-2xl bg-black border border-white/5 shrink-0">
                        <video
                            src={src}
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                            <Play size={20} className="text-white fill-current drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col items-start text-left overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">Video</span>
                        <span className="text-white text-sm font-semibold leading-tight truncate w-full">Click to play</span>
                        <span className="text-slate-400 text-[10px] mt-0.5 font-medium truncate w-full">
                            {src.split('/').pop()?.split('?')[0] || 'Video Message'}
                        </span>
                    </div>

                    <div className="absolute -top-1.5 -right-1.5 bg-blue-600 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
                        <Maximize2 size={10} className="text-white" />
                    </div>
                </button>
            </div>
        );
    }

    // Expanded Full Player
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                ref={containerRef}
                onMouseMove={resetControlsTimeout}
                onTouchStart={resetControlsTimeout}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
            >
                <video
                    ref={videoRef}
                    onClick={togglePlay}
                    className="w-full h-full object-contain cursor-pointer"
                    poster={poster}
                    muted={isMuted}
                    playsInline
                    autoPlay
                >
                    <source src={src} type="video/mp4" />
                </video>

                {/* Top Header Controls */}
                <div className={`
          absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-20 transition-opacity duration-500
          ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <h3 className="text-white font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs">
                            {src.split('/').pop()?.split('?')[0] || 'Video Player'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={src}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black/60 hover:bg-white/10 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl text-white transition-all shadow-xl flex items-center justify-center"
                            title="Download"
                        >
                            <Download size={16} />
                        </a>
                        <button
                            onClick={closePlayer}
                            className="bg-black/60 hover:bg-red-500/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl text-white transition-all shadow-xl"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Center Play Button Overlay */}
                <div
                    onClick={togglePlay}
                    className={`
            absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500
            ${isPlaying ? 'opacity-0 scale-150' : 'opacity-100 scale-100 bg-black/40'}
          `}
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl pointer-events-auto active:scale-90 transition-transform">
                        {isPlaying ? <Pause className="text-white fill-current" size={32} /> : <Play className="text-white fill-current ml-1" size={32} />}
                    </div>
                </div>

                {/* Bottom Canvas Controls */}
                <div className={`
          absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-500 z-20
          ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}>

                    {/* Progress Bar */}
                    <div
                        className="group/progress relative h-6 flex items-center w-full mb-1 sm:mb-2 cursor-pointer"
                        onClick={handleScrub}
                    >
                        <div className="w-full h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-600 transition-all opacity-0 group-hover/progress:opacity-100"
                            style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 sm:gap-5">
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-blue-400 p-1 transition-all active:scale-90"
                            >
                                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime -= 10; resetControlsTimeout(); }}
                                className="hidden sm:block text-gray-300 hover:text-white transition-colors active:scale-90"
                            >
                                <RotateCcw size={16} />
                            </button>

                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="text-gray-300 hover:text-white active:scale-90">
                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <input
                                    type="range" min="0" max="1" step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        const v = parseFloat(e.target.value);
                                        setVolume(v);
                                        setIsMuted(v === 0);
                                        if (videoRef.current) videoRef.current.volume = v;
                                    }}
                                    className="hidden sm:block w-0 group-hover/vol:w-20 transition-all duration-300 accent-blue-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="text-[10px] sm:text-xs font-medium tabular-nums text-gray-300">
                                {formatTime(currentTime)} <span className="text-gray-500 mx-1">/</span> {formatTime(duration)}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-5">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    let next = playbackRate + 0.5;
                                    if (next > 2) next = 0.5;
                                    setPlaybackRate(next);
                                    if (videoRef.current) videoRef.current.playbackRate = next;
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-blue-400 active:scale-90 transition-transform"
                            >
                                {playbackRate.toFixed(1)}x
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); videoRef.current?.requestPictureInPicture(); }}
                                className="hidden sm:block text-gray-300 hover:text-white active:scale-90 transition-transform"
                            >
                                <ExternalLink size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); containerRef.current?.requestFullscreen(); }}
                                className="text-gray-300 hover:text-white active:scale-90 transition-transform"
                            >
                                <Maximize size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
