import React, { useState } from "react";

export default function AlbumCard({ title, artist, coverUrl, onClick, songCount }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      className="group relative bg-neutral-900 p-4 rounded-lg 
      hover:bg-neutral-800 transition-all duration-300 ease-out
      cursor-pointer shadow-lg shadow-black/40 hover:shadow-2xl hover:shadow-black/60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Album Cover Container */}
      <div className="relative mb-4 aspect-square rounded-md overflow-hidden bg-neutral-800 shadow-lg">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-neutral-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
        )}

        {/* Play Button - Removed */}
      </div>

      {/* Album Info */}
      <div className="mb-2">
        <h3
          className="text-white font-bold text-base mb-1 truncate"
          title={title}
        >
          {title}
        </h3>
        <p
          className="text-neutral-400 text-sm truncate"
          title={artist || "Unknown Artist"}
        >
          {artist || "Unknown Artist"}
        </p>
        {songCount && (
          <p className="text-neutral-500 text-xs mt-1">
            {songCount} {songCount === 1 ? 'song' : 'songs'}
          </p>
        )}
      </div>
    </div>
  );
}