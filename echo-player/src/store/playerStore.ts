import { create } from 'zustand';

export interface Track {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    uri: string;
    artwork?: string;
    isLocal: boolean;
}

interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    position: number;
    duration: number;
    queue: Track[];
    queueIndex: number;

    // Actions
    setTrack: (track: Track) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    seekTo: (position: number) => void;
    next: () => Promise<void>;
    previous: () => Promise<void>;
    setQueue: (tracks: Track[], startIndex?: number) => void;
}

const audio = new Audio();

export const usePlayerStore = create<PlayerState>((set, get) => {

    audio.ontimeupdate = () => {
        set({
            position: audio.currentTime * 1000,
            duration: audio.duration * 1000 || 0
        });
    };

    audio.onended = () => {
        get().next();
    };

    audio.onplay = () => set({ isPlaying: true });
    audio.onpause = () => set({ isPlaying: false });

    return {
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        queue: [],
        queueIndex: 0,

        setTrack: async (track: Track) => {
            audio.src = track.uri;
            try {
                await audio.play();
                set({ currentTrack: track, isPlaying: true });
            } catch (e) {
                console.error("Audio playback failed", e);
                set({ currentTrack: track, isPlaying: false });
            }
        },

        play: async () => {
            if (audio.src) await audio.play();
        },

        pause: async () => {
            audio.pause();
        },

        seekTo: (position: number) => {
            if (Number.isFinite(position)) {
                audio.currentTime = position / 1000;
                set({ position });
            }
        },

        next: async () => {
            const { queue, queueIndex } = get();
            if (queue.length === 0) return;

            const nextIndex = (queueIndex + 1) % queue.length;
            set({ queueIndex: nextIndex });
            if (queue[nextIndex]) {
                await get().setTrack(queue[nextIndex]);
            }
        },

        previous: async () => {
            const { queue, queueIndex, position } = get();
            if (queue.length === 0) return;

            if (position > 3000) {
                audio.currentTime = 0;
                return;
            }

            const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
            set({ queueIndex: prevIndex });
            if (queue[prevIndex]) {
                await get().setTrack(queue[prevIndex]);
            }
        },

        setQueue: (tracks: Track[], startIndex = 0) => {
            set({ queue: tracks, queueIndex: startIndex });
        },
    };
});
