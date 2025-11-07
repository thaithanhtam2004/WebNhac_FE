import React from "react";
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
  // Ngăn lỗi khi song chưa có
  if (!song) return null;

  const isCurrentSong = currentTrack?.songId === song?.songId;

  return (
    <div
      className="bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
      p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
      flex flex-col items-center text-center h-72 w-full"
    >
      {/* Ảnh bài nhạc + PlayButton */}
      <div className="relative w-40 h-40 rounded-lg mb-3 flex items-center justify-center overflow-hidden bg-gray-800/70">
        {/* Cover image */}
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="absolute w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="absolute w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs">
            Không có ảnh
          </div>
        )}

        {/* PlayButton luôn nằm trên cùng */}
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
          {song.title}
        </p>
        <p className="text-xs text-pink-200 truncate w-32">
          {song.artist || "Unknown Artist"}
        </p>
      </div>

      {/* Like + Add Playlist */}
      <div className="flex justify-center gap-6 text-base">
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
