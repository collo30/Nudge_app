
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Music, Upload, Search, List, Grid, Settings } from "lucide-react";
import { usePlayerStore, type Track } from "../store/playerStore";
import { formatDuration } from "../utils/cn";

export default function Library() {
    const { setTrack, currentTrack, isPlaying, play, pause, setQueue } = usePlayerStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [localTracks, setLocalTracks] = useState<Track[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newTracks: Track[] = Array.from(files).map((file) => ({
            id: `local-${Date.now()}-${Math.random()}`,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Local File',
            album: 'Unknown Album',
            duration: 0,
            uri: URL.createObjectURL(file),
            isLocal: true,
            artwork: '', // Use default icon
        }));

        setLocalTracks(prev => [...prev, ...newTracks]);
    };

    const playTrack = (track: Track) => {
        if (currentTrack?.id === track.id) {
            isPlaying ? pause() : play();
        } else {
            setTrack(track);
            setQueue(localTracks);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background safe-area-top">
            {/* Header */}
            <header className="p-6 pb-2 flex justify-between items-end bg-gradient-to-b from-background to-transparent sticky top-0 z-10 backdrop-blur-sm">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-1">Library</h1>
                    <p className="text-white/40 text-sm font-medium">{localTracks.length} Songs</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        {viewMode === 'list' ? <Grid size={20} /> : <List size={20} />}
                    </button>
                    <Link to="/settings" className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                        <Settings size={20} />
                    </Link>
                </div>
            </header>

            {/* Quick Actions */}
            <div className="px-6 mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary rounded-full text-white text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform whitespace-nowrap"
                >
                    <Upload size={16} /> Import Music
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="audio/*"
                    className="hidden"
                />
            </div>

            {/* Track List */}
            <div className={`flex-1 overflow-y-auto px-6 pb-32 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-2'}`}>
                {localTracks.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Music size={64} className="mb-4 text-white/20" />
                        <h3 className="text-lg font-bold text-white mb-2">No Music Found</h3>
                        <p className="text-sm text-white/60 max-w-[200px]">Import your MP3 files to start building your library.</p>
                    </div>
                ) : (
                    localTracks.map((track) => (
                        <div
                            key={track.id}
                            onClick={() => playTrack(track)}
                            className={`group cursor-pointer transition-all active:scale-[0.98] ${viewMode === 'grid'
                                ? "bg-surface rounded-2xl p-3 border border-white/5 hover:border-white/20"
                                : `flex items-center p-3 rounded-2xl hover:bg-white/5 border border-transparent ${currentTrack?.id === track.id ? "bg-white/5 border-primary/20" : ""}`
                                }`}
                        >
                            <div className={`relative overflow-hidden ${viewMode === 'grid'
                                ? "aspect-square w-full rounded-xl mb-3"
                                : "w-14 h-14 rounded-xl flex-shrink-0"
                                } ${currentTrack?.id === track.id ? "ring-2 ring-primary" : ""}`}>
                                {track.artwork ? (
                                    <img src={track.artwork} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-surface-highlight to-surface flex items-center justify-center">
                                        <Music className="text-white/20" size={viewMode === 'grid' ? 32 : 20} />
                                    </div>
                                )}
                                {currentTrack?.id === track.id && isPlaying && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                        <div className="flex gap-1 h-4 items-end">
                                            <div className="w-1 bg-primary animate-[music-bar_0.5s_ease-in-out_infinite]" />
                                            <div className="w-1 bg-primary animate-[music-bar_0.7s_ease-in-out_infinite] delay-75" />
                                            <div className="w-1 bg-primary animate-[music-bar_0.6s_ease-in-out_infinite] delay-150" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={viewMode === 'list' ? "ml-4 flex-1 min-w-0" : ""}>
                                <h3 className={`font-bold truncate leading-tight ${viewMode === 'grid' ? "text-base mb-1" : "text-base"
                                    } ${currentTrack?.id === track.id ? "text-primary" : "text-white"}`}>
                                    {track.title}
                                </h3>
                                <p className="text-white/40 text-xs truncate font-medium">
                                    {track.artist}
                                </p>
                            </div>

                            {viewMode === 'list' && (
                                <div className="text-xs text-white/20 font-medium ml-4">
                                    {formatDuration(0)} {/* Placeholder duration */}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Add global styles for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes music-bar {
        0%, 100% { height: 4px; }
        50% { height: 16px; }
    }
`;
document.head.appendChild(style);
