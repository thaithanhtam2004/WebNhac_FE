import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-6 border-b border-gray-700/40
                    bg-gradient-to-r from-[#1a1a1a]/60 via-[#2a2a2a]/60 to-[#1a1a1a]/60
                    backdrop-blur-md sticky top-0 z-10 flex justify-center">
      <div className="relative w-1/2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Tìm kiếm bài hát, nghệ sĩ..."
          className="w-full pl-12 pr-12 py-2 rounded-lg 
                     bg-gray-800/50 text-white placeholder-pink-400
                     focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-200"
        />
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                     hover:bg-pink-500/20 transition"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
