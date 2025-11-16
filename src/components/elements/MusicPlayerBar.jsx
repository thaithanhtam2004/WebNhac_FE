import { usePlayer } from "../providers/PlayerContext";
import { useNavigate } from "react-router-dom";
import { Heart, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, FileText, Shuffle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function MusicPlayerBar() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const intervalRef = useRef(null);

  const track = currentTrack;
  if (!track) return null;

  // Theo dõi thời gian chạy
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (audioRef.current?.duration) setCurrentTime(audioRef.current.currentTime);
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [track, audioRef]);

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
  }, [repeat, track, play, pause, audioRef]);

  // Âm lượng
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, audioRef]);

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

  const handleOpenLyrics = () => {
    navigate(`/lyrics/${track.songId}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const progressPercentage = (currentTime / audioRef.current?.duration) * 100 || 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-neutral-900 to-neutral-900/95 border-t border-neutral-800/50 flex items-center justify-between px-6 z-50 backdrop-blur-xl shadow-2xl">

      {/* LEFT - Song Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <div className="relative group">
          <img 
            src={track.coverUrl || "/default-cover.jpg"} 
            alt={track.title}
            className="h-14 w-14 rounded-md object-cover shadow-lg ring-1 ring-white/10 transition-all duration-300 group-hover:ring-cyan-500/50" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate hover:text-cyan-400 transition-colors cursor-pointer">
            {track.title}
          </p>
          <p className="text-sm text-gray-400 truncate hover:text-gray-300 transition-colors cursor-pointer">
            {track.artist}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 hover:bg-white/5 rounded-full transition-all group"
            title={isLiked ? "Bỏ thích" : "Yêu thích"}
          >
            <Heart 
              size={20} 
              className={`transition-all ${
                isLiked 
                  ? "fill-red-500 text-red-500" 
                  : "text-gray-400 group-hover:text-white group-hover:scale-110"
              }`}
            />
          </button>
        </div>
      </div>

      {/* CENTER - Player Controls */}
      <div className="flex flex-col items-center w-[40%] max-w-2xl">
        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <button 
            className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110"
            title="Phát ngẫu nhiên"
          >
            <Shuffle size={18} />
          </button>

          <button 
            className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110"
            title="Bài trước"
          >
            <SkipBack size={22} />
          </button>
          
          <button
            onClick={() => (isPlaying ? pause() : play(track))}
            className="flex items-center justify-center bg-white hover:bg-gray-100 text-black rounded-full w-11 h-11 transition-all hover:scale-105 shadow-lg"
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <button 
            className="p-2 text-gray-400 hover:text-white transition-all hover:scale-110"
            title="Bài tiếp theo"
          >
            <SkipForward size={22} />
          </button>

          <button 
            onClick={() => setRepeat(!repeat)}
            className={`p-2 transition-all hover:scale-110 ${
              repeat ? "text-cyan-400" : "text-gray-400 hover:text-white"
            }`}
            title={repeat ? "Tắt lặp lại" : "Bật lặp lại"}
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs text-gray-400 font-medium min-w-[40px] text-right">
            {formatTime(currentTime)}
          </span>
          
          <div className="relative flex-1 h-1.5 bg-neutral-700/50 rounded-full overflow-hidden group cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all shadow-lg shadow-cyan-500/20"
              style={{ width: `${progressPercentage}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100"
              value={progressPercentage}
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercentage}% - 6px)` }}
            />
          </div>

          <span className="text-xs text-gray-400 font-medium min-w-[40px]">
            {formatTime(audioRef.current?.duration || 0)}
          </span>
        </div>
      </div>

      {/* RIGHT - Additional Controls */}
      <div className="flex items-center gap-3 w-[30%] justify-end min-w-[180px]">
        <button
          onClick={handleOpenLyrics}
          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all border border-cyan-500/20 hover:border-cyan-500/40 group"
          title="Xem lời bài hát"
        >
          <FileText size={16} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">Lyrics</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="100"
            value={isMuted ? 0 : volume} 
            onChange={(e) => {
              setVolume(e.target.value);
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            style={{
              background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(34 211 238) ${isMuted ? 0 : volume}%, rgb(64 64 64) ${isMuted ? 0 : volume}%, rgb(64 64 64) 100%)`
            }}
          />
        </div>
      </div>

    </footer>
  );
}