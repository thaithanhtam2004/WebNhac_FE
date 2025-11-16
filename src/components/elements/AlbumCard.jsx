import React from "react";

export default function AlbumCard({ title, artist, coverUrl, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-blue-600/40 via-purple-700/40 to-pink-600/40 
      p-4 rounded-xl shadow-lg shadow-black/30 hover:scale-105 transition-transform 
      flex flex-col items-center text-center h-72 w-full cursor-pointer"
    >
      {/* Album Cover */}
      <div className="relative w-40 h-40 rounded-lg mb-3 flex items-center justify-center overflow-hidden bg-gray-800/70 group">
        {/* Cover image */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs">
            Không có ảnh
          </div>
        )}

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      </div>

      {/* Album Info */}
      <div className="flex flex-col items-center mb-3">
        <p className="font-semibold text-white text-sm truncate w-32">
          {title}
        </p>
        <p className="text-xs text-pink-200 truncate w-32">
          {artist || "Unknown Artist"}
        </p>
      </div>
    </div>
  );
}