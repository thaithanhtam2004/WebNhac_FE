import React from "react";
import { Heart, ListPlus, Play } from "lucide-react";

export default function AlbumPage() {
  const album = {
    title: "Album Sample",
    artist: "Artist Name",
    cover: "https://i.scdn.co/image/ab67616d0000b273b3b3b3b3b3b3b3b3b3b3b3b3b3",
    releaseDate: "2025-10-01",
    songs: [
      { id: 1, title: "Song One", artist: "Artist Name", duration: "3:45", cover: "https://i.scdn.co/image/ab67616d0000b273c3c3c3c3c3c3c3c3c3c3c3c3c3c" },
      { id: 2, title: "Song Two", artist: "Artist Name", duration: "4:05", cover: "https://i.scdn.co/image/ab67616d0000b273d4d4d4d4d4d4d4d4d4d4d4d4d4d4" },
      { id: 3, title: "Song Three", artist: "Artist Name", duration: "3:55", cover: "https://i.scdn.co/image/ab67616d0000b273e5e5e5e5e5e5e5e5e5e5e5e5e5e5" },
    ],
  };

  return (
    <div className="flex gap-6">
      {/* Cột trái: Ảnh + Thông tin */}
      <div className="flex flex-col gap-4 w-64">
        <img
          src={album.cover}
          alt={album.title}
          className="w-full h-64 rounded-xl object-cover shadow-lg"
        />

        <div className="flex flex-col gap-2">
          <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg w-full hover:bg-cyan-500/40 transition">
            Phát tất cả
          </button>

          <h2 className="text-2xl font-bold text-white">{album.title}</h2>
          <p className="text-gray-400">{album.artist}</p>
          <p className="text-gray-400">Số bài hát: {album.songs.length}</p>
          <p className="text-gray-400">Ngày phát hành: {album.releaseDate}</p>
        </div>
      </div>

      {/* Cột phải: Danh sách bài hát */}
      <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
        <ul className="divide-y divide-gray-800">
          {album.songs.map((song, index) => (
            <li
              key={song.id}
              className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <span className="w-6 text-gray-400">{index + 1}</span>
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div>
                  <p className="text-base font-semibold text-white">{song.title}</p>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-500 cursor-pointer" />
                <ListPlus className="w-5 h-5 text-cyan-400 cursor-pointer" />
                <span className="text-gray-400">{song.duration}</span>
                <button className="p-2 bg-cyan-500/20 rounded-full hover:bg-cyan-500/40 transition">
                  <Play className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
