import { Plus } from "lucide-react";
import LikeButton from "./LikeButton";
import PlayButton from "./playButton";

export default function MusicCard({
  song,
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
}) {
  // ✅ Ngăn lỗi khi song chưa có
  if (!song) return null;

  const isCurrentSong = currentTrack?.songId === song?.songId;

  return (
    <div
      className="bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
      p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
      flex flex-col items-center text-center h-72 w-full"
    >
      {/* Ảnh bài nhạc */}
      <div className="relative w-40 h-40 bg-gray-800/70 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        <PlayButton
         variant="circle"
          song={song}
          isCurrent={isCurrentSong}
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
        />
      </div>

      {/* Thông tin bài hát */}
      <div className="flex flex-col items-center mb-3">
        <p className="font-semibold text-white text-sm truncate w-32">
          {song?.title}
        </p>
        <p className="text-xs text-pink-200 truncate w-32">
          {song?.artist}
        </p>
      </div>

      {/* Like + Add Playlist */}
      <div className="flex justify-center gap-6 text-base">
        <LikeButton songId={song?.songId} />

        <Plus
          size={18}
          className="cursor-pointer text-white hover:text-green-400 transition"
          onClick={() => alert(`🎵 Đã thêm "${song?.title}" vào playlist`)}
        />
      </div>
    </div>
  );
}
