
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePlayerStore, type Track } from "../store/playerStore";
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat } from "lucide-react";
import { formatDuration } from "../utils/cn";
import Visualizer from "../components/Visualizer";

export default function PlayerScreen() {
    const {
        currentTrack, isPlaying, play, pause, next, previous,
        position, duration, seekTo
    } = usePlayerStore();

    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (!dragging) {
            setProgress(position);
        }
    }, [position, dragging]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setProgress(val);
        setDragging(true);
        seekTo(val);
        setDragging(false);
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-between z-50 overflow-hidden">
            {/* Background Blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src={currentTrack.artwork || "https://picsum.photos/800"}
                    alt="Album Art Blur"
                    className="w-full h-full object-cover opacity-30 blur-3xl scale-125 saturate-200"
                />
            </div>

            {/* Header */}
            <div className="relative z-10 w-full px-6 pt-12 pb-4 flex justify-between items-center safe-area-top">
                <Link to="/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <span className="text-xl rotate-90">▼</span>
                </Link>
                <div className="text-xs uppercase tracking-widest text-white/60 font-medium">Now Playing</div>
                <div className="w-10"></div>
            </div>

            {/* Album Art */}
            <div className="relative z-10 w-full px-8 flex-1 flex items-center justify-center max-h-[50vh]">
                <div className={`aspect-square w-full max-w-[320px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out border border-white/5 ${isPlaying ? 'scale-100 rotate-0' : 'scale-90 rotate-2 opacity-80'}`}>
                    <img
                        src={currentTrack.artwork || "https://picsum.photos/600"}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Info & Controls */}
            <div className="relative z-10 w-full px-8 pb-12 safe-area-bottom backdrop-blur-sm bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">{currentTrack.title}</h1>
                    <p className="text-lg text-white/60 font-medium">{currentTrack.artist}</p>
                </div>

                {/* Visualizer integrated */}
                <div className="h-16 mb-4 w-full opacity-60">
                    <Visualizer />
                </div>

                {/* Scrubber */}
                <div className="mb-8 group">
                    <div className="flex justify-between text-xs font-semibold text-white/40 mb-2 font-mono">
                        <span>{formatDuration(progress)}</span>
                        <span>{formatDuration(duration)}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={progress}
                        onChange={(e) => {
                            setProgress(Number(e.target.value));
                            setDragging(true);
                        }}
                        onMouseUp={(e) => {
                            seekTo(Number(e.currentTarget.value));
                            setDragging(false);
                        }}
                        onTouchEnd={(e) => {
                            seekTo(Number(e.currentTarget.value));
                            setDragging(false);
                        }}
                        className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer accent-primary focus:outline-none hover:h-4 transition-all"
                    />
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between mb-8">
                    <button className="text-white/40 hover:text-white transition-colors p-2">
                        <Shuffle size={20} />
                    </button>

                    <button
                        onClick={() => previous()}
                        className="text-white hover:text-primary transition-colors active:scale-90 transform duration-100 p-4"
                    >
                        <SkipBack size={32} fill="currentColor" />
                    </button>

                    <button
                        onClick={isPlaying ? () => pause() : () => play()}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                        {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                    </button>

                    <button
                        onClick={() => next()}
                        className="text-white hover:text-primary transition-colors active:scale-90 transform duration-100 p-4"
                    >
                        <SkipForward size={32} fill="currentColor" />
                    </button>

                    <button className="text-white/40 hover:text-white transition-colors p-2">
                        <Repeat size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
