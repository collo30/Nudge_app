import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Play, Music } from "lucide-react";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/cn";

export default function SearchPage() {
    const { queue, setTrack, isPlaying, play, pause, currentTrack } = usePlayerStore();
    const [query, setQuery] = useState("");

    const filteredTracks = useMemo(() => {
        if (!query.trim()) return [];
        return queue.filter(t =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.artist.toLowerCase().includes(query.toLowerCase()) ||
            t.album.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, queue]);

    return (
        <div className="flex flex-col h-full bg-background safe-area-top">
            <header className="p-4 border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search your library..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32">
                {query && filteredTracks.length === 0 && (
                    <div className="text-center py-12 text-white/40">
                        No results found for "{query}"
                    </div>
                )}

                {!query && (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-white/40">
                        <SearchIcon size={48} className="mb-4 opacity-50" />
                        <p>Search for songs, artists, or albums</p>
                    </div>
                )}

                {filteredTracks.map(track => (
                    <div
                        key={track.id}
                        onClick={() => {
                            if (currentTrack?.id === track.id) {
                                isPlaying ? pause() : play();
                            } else {
                                setTrack(track);
                            }
                        }}
                        className={`flex items-center p-3 rounded-xl active:bg-white/10 transition-colors cursor-pointer ${currentTrack?.id === track.id ? 'bg-white/5 border border-primary/20' : ''}`}
                    >
                        <div className="w-12 h-12 bg-surface-highlight rounded-lg flex items-center justify-center text-white/20 flex-shrink-0 overflow-hidden">
                            {track.artwork ? (
                                <img src={track.artwork} className="w-full h-full object-cover" />
                            ) : (
                                <Music size={20} />
                            )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <h3 className={`font-semibold truncate text-sm ${currentTrack?.id === track.id ? 'text-primary' : 'text-white'}`}>
                                {track.title}
                            </h3>
                            <p className="text-white/40 text-xs truncate">{track.artist} • {track.album}</p>
                        </div>
                        <div className="text-xs text-white/30 font-medium ml-2">
                            {formatDuration(track.duration)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
