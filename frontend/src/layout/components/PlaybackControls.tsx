import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/pages/album/AlbumPage";
import { usePlayerStore } from "@/stores/usePlayerStore"
import { Laptop2, ListMusic, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PlaybackControls = () => {
    const { currentSong, isPlaying, playNext, playPrevious, togglePlay } = usePlayerStore();

    // Initialize the audio volume
    const [volume, setVolume] = useState(50);

    // Initialize the audio progress
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = document.querySelector('audio');

        const audio = audioRef.current;
        if (!audio) return;

        // Update audio progress
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('durationchange', updateDuration);

        const handleEnded = () => {
            usePlayerStore.setState({ isPlaying: false });
        };

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        }

    }, [currentSong]);

    // Update progression bar
    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
        }
    }


    return <footer className="h-20 sm:h-24 bg-zinc-900 border-t border-zinc-800 px-4">
        <div className="flex justify-between items-center h-full max-w-[1800px] mx-auto">

            {/* Currently playing song */}
            <div className="hidden sm:flex items-center gap-4 min-w-[180px] mx-auto">
                {currentSong &&
                    <>
                        <img src={currentSong.imageUrl} alt={currentSong.title}
                            className="w-14 h-14 object-cover rounded-md" />
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate hover:underline cursor-pointer">
                                {currentSong.title}
                            </div>
                            <div className="text-sm text-zinc-400 truncate hover:underline cursor-pointer">
                                {currentSong.artist}
                            </div>
                        </div>
                    </>
                }
            </div>

            {/* Playback controls */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Button size='icon' variant='ghost' className="hidden sm:inline-flex hover:text-white text-zinc-400">
                        <Shuffle className="w-4 h-4" />
                    </Button>

                    <Button size='icon' variant='ghost' className="hover:text-white text-zinc-400" onClick={playPrevious}
                        disabled={!currentSong}
                    >
                        <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button size='icon' variant='ghost' className="bg-white hover:bg-white/80 text-black rounded-full h-8 w-8"
                        onClick={togglePlay} disabled={!currentSong}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button size='icon' variant='ghost' className="hover:text-white text-zinc-400" onClick={playNext}
                        disabled={!currentSong}
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>

                    <Button size='icon' variant='ghost' className="hover:text-white text-zinc-400"
                    >
                        <Repeat className="w-4 h-4" />
                    </Button>
                </div>
                {/* Progress bar */}
                <div className="hidden sm:flex items-center gap-2 w-full">
                    {/* Current time */}
                    <div className="text-sm text-zinc-400">
                        {formatDuration(currentTime)}
                    </div>

                    <Slider value={[currentTime]} onValueChange={handleSeek}
                        max={duration || 100}
                        step={1}
                        className="w-full"
                    />

                    {/* Duration of the song */}
                    <div className="text-sm text-zinc-400">
                        {formatDuration(duration)}
                    </div>
                </div>
            </div>

            {/* Volume control */}
            <div className="hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end">
                <Button size='icon' variant='ghost' className="hover:text-white text-zinc-400">
                    <Mic2 className="w-4 h-4" />
                </Button>

                <Button size='icon' variant='ghost' className="hover:text-white text-zinc-400">
                    <ListMusic className="w-4 h-4" />
                </Button>

                <Button size='icon' variant='ghost' className="hover:text-white text-zinc-400">
                    <Laptop2 className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-2">
                    <Volume1 className="w-4 h-4" />
                </div>

                <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    className="w-24"
                    onValueChange={(value) => {
                        setVolume(value[0]);
                        if (audioRef.current) {
                            audioRef.current.volume = value[0] / 100;
                        }
                    }} />
            </div>
        </div>
    </footer>
}

export default PlaybackControls