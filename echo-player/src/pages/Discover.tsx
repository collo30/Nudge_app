import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { usePlayerStore, type Track } from "../store/playerStore";
import { Play, Pause, Heart, X } from "lucide-react";
import { useState } from "react";

const DEMO_TRACKS: Track[] = [
    {
        id: '1', title: 'Summer Vibes', artist: 'Chill House', album: 'Beach Sessions', duration: 215000, uri: 'https://cdn.pixabay.com/download/audio/2023/10/24/audio_9855365551.mp3', artwork: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop', isLocal: false,
    },
    {
        id: '2', title: 'Midnight Dreams', artist: 'Synthwave Artist', album: 'Neon Nights', duration: 198000, uri: 'https://cdn.pixabay.com/download/audio/2023/09/25/audio_27d9a8e0f1.mp3', artwork: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop', isLocal: false,
    },
    {
        id: '3', title: 'Electric Feel', artist: 'Indie Pop Band', album: 'Golden Hour', duration: 242000, uri: 'https://cdn.pixabay.com/download/audio/2023/10/25/audio_515252875f.mp3', artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop', isLocal: false,
    },
];

export default function Discover() {
    const [tracks, setTracks] = useState(DEMO_TRACKS);
    const { isPlaying, currentTrack, play, pause, setTrack } = usePlayerStore();

    if (tracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-4xl">🎵</span>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">No more tracks</h2>
                <button
                    onClick={() => setTracks(DEMO_TRACKS)}
                    className="px-6 py-3 bg-surface border border-white/10 rounded-full hover:bg-white/5 active:scale-95 transition-all text-sm font-medium"
                >
                    Refresh Mix
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 pb-32 safe-area-top">
            <h1 className="absolute top-10 left-6 text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Discover
            </h1>

            <div className="relative w-full max-w-sm aspect-[3/4] mt-12">
                {tracks.map((track, index) => (
                    <SongCard
                        key={track.id}
                        track={track}
                        index={index}
                        onSwipe={() => setTracks(prev => prev.filter(t => t.id !== track.id))}
                        onPlay={() => {
                            if (currentTrack?.id === track.id) {
                                isPlaying ? pause() : play();
                            } else {
                                setTrack(track);
                            }
                        }}
                        isPlaying={currentTrack?.id === track.id && isPlaying}
                    />
                )).reverse()}
            </div>
        </div>
    );
}

function SongCard({ track, index, onSwipe, onPlay, isPlaying }: { track: Track, index: number, onSwipe: () => void, onPlay: () => void, isPlaying: boolean }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const controls = useAnimation();

    const handleDragEnd = async (_: any, info: any) => {
        if (Math.abs(info.offset.x) > 100) {
            await controls.start({ x: info.offset.x > 0 ? 500 : -500, opacity: 0 });
            onSwipe();
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    if (index > 1) return null;

    return (
        <motion.div
            style={{ x, rotate, opacity, zIndex: 10 - index, scale: index === 0 ? 1 : 0.95, y: index * 10 }}
            drag={index === 0 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            className="absolute top-0 left-0 w-full h-full rounded-3xl overflow-hidden bg-surface border border-white/10 shadow-2xl"
        >
            <img
                src={track.artwork}
                alt={track.title}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />

            {/* Overlay Buttons */}
            <motion.div style={{ opacity: useTransform(x, [-100, -20], [1, 0]) }} className="absolute top-8 right-8 p-4 bg-red-500/20 rounded-full border border-red-500 text-red-500">
                <X size={32} />
            </motion.div>
            <motion.div style={{ opacity: useTransform(x, [20, 100], [0, 1]) }} className="absolute top-8 left-8 p-4 bg-green-500/20 rounded-full border border-green-500 text-green-500">
                <Heart size={32} fill="currentColor" />
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 p-6 pt-12">
                <h2 className="text-3xl font-black text-white leading-tight mb-1">{track.title}</h2>
                <p className="text-lg text-white/60 font-medium mb-6">{track.artist}</p>

                <button
                    onClick={(e) => { e.stopPropagation(); onPlay(); }}
                    className="w-16 h-16 rounded-full bg-primary text-surface flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
            </div>
        </motion.div>
    );
}
