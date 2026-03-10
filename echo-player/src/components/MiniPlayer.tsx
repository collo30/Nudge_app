
import { motion } from "framer-motion";
import { Play, Pause, SkipForward } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import { Link, useLocation } from "react-router-dom";

export default function MiniPlayer() {
    const { currentTrack, isPlaying, play, pause, next, position, duration } = usePlayerStore();
    const location = useLocation();

    if (!currentTrack || location.pathname === '/player') return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-24 left-4 right-4 z-40 h-16 bg-surface-highlight/95 backdrop-blur-3xl rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center pr-4 overflow-hidden"
        >
            <Link to="/player" className="absolute inset-0 z-0 bg-transparent" />

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 w-full bg-white/5">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Artwork */}
            <div className="w-12 h-12 ml-2 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 relative z-10 pointer-events-none">
                <img
                    src={currentTrack.artwork || "https://picsum.photos/200"}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 ml-3 overflow-hidden z-10 pointer-events-none">
                <h3 className="text-white text-sm font-bold truncate pr-2">{currentTrack.title}</h3>
                <p className="text-white/60 text-xs truncate">{currentTrack.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(); }}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-gray-200"
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="text-white/60 hover:text-white active:scale-95 transition-transform p-1"
                >
                    <SkipForward size={24} fill="currentColor" />
                </button>
            </div>
        </motion.div>
    );
}
