import React, { useState } from "react";
import PlayButton from "./playButton";
import LikeButton from "./LikeButton";
import AddToPlaylistButton from "./AddToPlaylistButton";

export default function MusicCard({
  song,
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  userId,
  initialLiked,
  onLikeChange,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Ngăn lỗi khi song chưa có dữ liệu
  if (!song) return null;

  const isCurrentSong = currentTrack?.songId === song?.songId;

  // ✅ FIX: Logic xác định tên ca sĩ chính xác với fallback
  // 1. singerName: Thường dùng khi query SQL có alias (ví dụ: SELECT name AS singerName)
  // 2. singer.name: Dùng khi dữ liệu trả về dạng object lồng nhau (nested relation)
  // 3. artist: Tên trường cũ hoặc fallback
  // 4. "Unknown Artist": Giá trị mặc định nếu không tìm thấy gì
  const artistName = 
    song.singerName || 
    song.singer?.name || 
    song.artist || 
    "Unknown Artist";

  return (
    <div
      className="group relative bg-neutral-900 p-4 rounded-lg 
      hover:bg-neutral-800 transition-all duration-300 ease-out
      cursor-pointer shadow-lg shadow-black/40 hover:shadow-2xl hover:shadow-black/60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Cover Image Container */}
      <div className="relative mb-4 aspect-square rounded-md overflow-hidden bg-neutral-800 shadow-lg">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-neutral-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        {/* Play Button - Appears on Hover */}
        <div
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 
          translate-y-2 group-hover:translate-y-0 transition-all duration-300"
        >
          <PlayButton
            variant="circle"
            song={song}
            isCurrent={isCurrentSong}
            isPlaying={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
          />
        </div>
      </div>

      {/* Song Info */}
      <div className="mb-2">
        <h3
          className="text-white font-bold text-base mb-1 truncate"
          title={song.title}
        >
          {song.title}
        </h3>
        {/* ✅ Hiển thị tên ca sĩ đã xử lý */}
        <p
          className="text-neutral-400 text-sm truncate"
          title={artistName}
        >
          {artistName}
        </p>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 
        transition-opacity duration-300"
      >
        <LikeButton
          userId={userId}
          songId={song.songId}
          initialLiked={initialLiked}
          onChange={onLikeChange}
        />

        <AddToPlaylistButton song={song} />
      </div>
    </div>
  );
}