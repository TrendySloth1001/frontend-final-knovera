import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Bookmark, Volume2, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, className }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [showToast, setShowToast] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const visualizerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const barsRef = useRef<number[]>([]);

    const [barCount, setBarCount] = useState(40);

    // Initialize bars and handle resize
    useEffect(() => {
        const updateBarCount = () => {
            const width = window.innerWidth;
            setBarCount(width < 400 ? 20 : 40);
        };

        updateBarCount();
        window.addEventListener('resize', updateBarCount);

        return () => window.removeEventListener('resize', updateBarCount);
    }, []);

    useEffect(() => {
        barsRef.current = Array(barCount).fill(0).map(() => 8);
    }, [barCount]);

    // Format time (seconds to M:SS)
    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Toggle Play/Pause
    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle Seek
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = pos * audioRef.current.duration;
    };

    // Volume Change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
    };

    // Save/Bookmark
    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    // Animation Loop for Analog Visualizer
    const animate = () => {
        if (audioRef.current?.paused) {
            barsRef.current = barsRef.current.map(() => 8);
            updateBarsUI();
            return;
        }

        barsRef.current = barsRef.current.map((_, i) => {
            const multiplier = Math.sin(Date.now() / 150 + i * 0.5) * 0.5 + 0.5;
            return 8 + (Math.random() * 85 * multiplier);
        });

        updateBarsUI();
        animationRef.current = requestAnimationFrame(animate);
    };

    const updateBarsUI = () => {
        const visualizer = visualizerRef.current;
        if (!visualizer) return;
        const barElements = visualizer.children;
        for (let i = 0; i < barElements.length; i++) {
            const el = barElements[i] as HTMLElement;
            el.style.height = `${barsRef.current[i]}%`;
        }
    };

    useEffect(() => {
        if (isPlaying) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationRef.current);
            barsRef.current = barsRef.current.map(() => 8);
            updateBarsUI();
        }
        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying]);

    return (
        <div className={`relative w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 font-sans text-slate-100 ${className}`}>

            {/* Toast Notification */}
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-500 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 pointer-events-none ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <span className="text-xs font-semibold whitespace-nowrap">Saved to collection!</span>
            </div>


            {/* Visualizer Area */}
            <div
                ref={visualizerRef}
                className="h-[60px] flex items-center justify-center gap-[2px] px-1 overflow-hidden"
            >
                {Array(barCount).fill(0).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                        style={{ height: '8%' }}
                    />
                ))}
            </div>

            {/* Seek Control */}
            <div className="space-y-1">
                <div
                    className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer relative overflow-hidden group/seek"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute left-0 top-0 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-100"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] font-medium text-slate-400 tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between gap-2 md:gap-3">
                <button
                    onClick={handleSave}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                >
                    <Bookmark size={10} />
                </button>

                <div className="flex items-center gap-1 md:gap-3">
                    <button className="p-1.5 text-slate-400 hover:text-white transition-all active:scale-95">
                        <SkipBack size={12} className="fill-current" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="ml-0.5 fill-current" />}
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-white transition-all active:scale-95">
                        <SkipForward size={12} className="fill-current" />
                    </button>
                </div>

                <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 md:px-2 py-1 rounded-xl">
                    <Volume2 size={10} className="text-slate-500" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 md:w-10 h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                    />
                </div>
            </div>

            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    );
};

export default AudioPlayer;
