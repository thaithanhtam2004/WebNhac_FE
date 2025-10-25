import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Plus,
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward,
  Repeat,
} from "lucide-react";

export default function MusicPlayerBar({ tracks, isPlaying, onPlayPause }) {
  const track = tracks[0];
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [repeat, setRepeat] = useState(false); // 🔁 Trạng thái lặp

  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Khi track thay đổi
  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = new Audio(track.fileUrl);
    audioRef.current.volume = volume / 100;

    const handleEnded = () => {
      if (repeat) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        onPlayPause(false);
      }
    };

    audioRef.current.addEventListener("ended", handleEnded);

    if (isPlaying) audioRef.current.play();

    return () => {
      audioRef.current.removeEventListener("ended", handleEnded);
    };
  }, [track, repeat]);

  // Play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Cập nhật thời gian phát
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (audioRef.current?.duration)
        setCurrentTime(audioRef.current.currentTime);
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [track]);

  // Seek
  const handleSeek = (e) => {
    if (!audioRef.current?.duration) return;
    const time = (audioRef.current.duration * e.target.value) / 100;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between px-8 z-50 backdrop-blur-md">
      {/* LEFT SECTION - Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        <img
          src={track.image}
          alt="track"
          className="h-12 w-12 rounded-lg object-cover bg-neutral-700"
        />
        <div>
          <p className="font-medium text-white">{track.title}</p>
          <p className="text-sm text-gray-400">{track.artist}</p>
        </div>
        <div className="flex gap-3 ml-4 text-gray-300">
          <Heart size={18} className="cursor-pointer hover:text-white" />
          <Plus size={18} className="cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* CENTER SECTION - Controls */}
      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center justify-center gap-6 text-gray-300 mb-2">
          <SkipBack
            size={20}
            className="cursor-pointer hover:text-white transition"
            onClick={() => console.log("Previous track")}
          />
          <button
            onClick={() => onPlayPause(!isPlaying)}
            className="flex items-center justify-center bg-white text-black rounded-full w-10 h-10 hover:scale-105 transition"
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </button>
          <SkipForward
            size={20}
            className="cursor-pointer hover:text-white transition"
            onClick={() => console.log("Next track")}
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md h-1 bg-neutral-700 rounded-full relative">
          <div
            className="h-1 bg-white rounded-full transition-all duration-300"
            style={{
              width: `${
                (currentTime / audioRef.current?.duration) * 100 || 0
              }%`,
            }}
          ></div>
          <input
            type="range"
            min="0"
            max="100"
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

      {/* RIGHT SECTION - Volume + Repeat */}
      <div className="flex items-center justify-end gap-5 text-gray-300 w-1/3">
        {/* 🔁 Repeat button */}
        <button
          onClick={() => setRepeat(!repeat)}
          className={`transition ${
            repeat
              ? "text-green-400"
              : "text-gray-400 hover:text-white"
          }`}
          title="Lặp lại bài hát"
        >
          <Repeat size={18} />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 size={18} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-28 accent-white cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
}
