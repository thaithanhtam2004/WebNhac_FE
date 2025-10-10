import React from "react";
import { Search } from "lucide-react";

export default function FavoriteSearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative w-full max-w-2xl"> {/* tăng độ rộng */}
      <input
        type="text"
        placeholder="Tìm kiếm bài hát yêu thích..."
        className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-200"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
    </div>
  );
}
