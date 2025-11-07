import { usePlayer } from "../providers/PlayerContext";
import { Heart, Plus, Play, Pause, Volume2, SkipBack, SkipForward, Repeat } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function MusicPlayerBar() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [repeat, setRepeat] = useState(false);
  const intervalRef = useRef(null);

  const track = currentTrack;
  if (!track) return null; // Không render nếu chưa chọn bài hát

  // Theo dõi thời gian chạy
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (audioRef.current?.duration) setCurrentTime(audioRef.current.currentTime);
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [track]);

  // Lặp bài
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        play(track);
      } else {
        pause();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [repeat, track]);

  // Âm lượng
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const time = (audio.duration * e.target.value) / 100;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const m = Math.floor(time / 60) || 0;
    const s = Math.floor(time % 60) || 0;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between px-8 z-50 backdrop-blur-md">

      {/* LEFT */}
      <div className="flex items-center gap-4 w-1/3">
        <img src={track.coverUrl || "/default-cover.jpg"} className="h-12 w-12 rounded-lg object-cover" />
        <div>
          <p className="font-medium text-white">{track.title}</p>
          <p className="text-sm text-gray-400">{track.artist}</p>
        </div>
      </div>

      {/* CENTER */}
      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center justify-center gap-6 text-gray-300 mb-2">
          <SkipBack size={20} />
          <button
            onClick={() => (isPlaying ? pause() : play(track))}
            className="flex items-center justify-center bg-white text-black rounded-full w-10 h-10"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <SkipForward size={20} />
        </div>

        <div className="w-full max-w-md h-1 bg-neutral-700 rounded-full relative">
          <div
            className="h-1 bg-white rounded-full"
            style={{ width: `${(currentTime / audioRef.current?.duration) * 100 || 0}%` }}
          />
          <input type="range" min="0" max="100"
            value={(currentTime / audioRef.current?.duration) * 100 || 0}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex justify-between w-full max-w-md text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioRef.current?.duration)}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5 text-gray-300 w-1/3 justify-end">
        <button onClick={() => setRepeat(!repeat)}>
          <Repeat className={repeat ? "text-green-400" : ""} size={18} />
        </button>

        <Volume2 size={18} />
        <input type="range" min="0" max="100"
          value={volume} onChange={(e) => setVolume(e.target.value)}
          className="w-28"
        />
      </div>

    </footer>
  );
}
