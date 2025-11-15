import { useState, useEffect, useRef } from "react";
import { Search, X, Music, User, Disc3 } from "lucide-react";
import { searchAll } from "../../services/songService";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ onSelectSong }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ songs: [], singers: [], genres: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search với debounce
  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setResults({ songs: [], singers: [], genres: [] });
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchAll(searchQuery);
        setResults(response.data || { songs: [], singers: [], genres: [] });
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults({ songs: [], singers: [], genres: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [searchQuery]);

  // Xử lý click vào bài hát
  const handleSelectSong = (song) => {
    setShowResults(false);
    setSearchQuery("");
    
    if (onSelectSong) {
      const formattedSong = {
        songId: song.songId,
        title: song.title,
        artist: song.singerName || "Unknown Artist",
        fileUrl: song.fileUrl,
        coverUrl: song.coverUrl,
        duration: song.duration,
      };
      onSelectSong(formattedSong);
    }
  };

  // Xử lý click vào nghệ sĩ
  const handleSelectSinger = (singer) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/singer/${singer.singerId}`); // ✅ URL: /singer/123
  };

  // Xử lý click vào thể loại
  const handleSelectGenre = (genre) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/genre/${genre.genreId}`); // ✅ URL: /genre/456
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults({ songs: [], singers: [], genres: [] });
    setShowResults(false);
  };

  const hasResults = results.songs?.length > 0 || results.singers?.length > 0 || results.genres?.length > 0;

  return (
    <div className="p-6 border-b border-gray-700/40
                    bg-gradient-to-r from-[#1a1a1a]/60 via-[#2a2a2a]/60 to-[#1a1a1a]/60
                    backdrop-blur-md sticky top-0 z-10 flex justify-center">
      <div className="relative w-1/2" ref={searchRef}>
        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Tìm kiếm bài hát, nghệ sĩ, thể loại..."
          className="w-full pl-4 pr-24 py-3 rounded-lg 
                     bg-gray-800/50 text-white placeholder-pink-400
                     focus:outline-none focus:ring-2 focus:ring-pink-400 
                     transition-all duration-200"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-md
                       hover:bg-gray-700/50 transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}

        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        {/* Live Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full mt-2 w-full bg-gray-800/95 backdrop-blur-xl 
                          rounded-lg shadow-2xl border border-gray-700/50 
                          max-h-[600px] overflow-y-auto z-50">
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 
                                border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-gray-400 mt-3">Đang tìm kiếm...</p>
              </div>
            ) : !hasResults ? (
              <div className="p-8 text-center">
                <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Không tìm thấy kết quả</p>
              </div>
            ) : (
              <div className="py-2">
                {/* 👤 NGHỆ SĨ */}
                {results.singers && results.singers.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2 text-gray-400 text-sm font-semibold">
                      Nghệ sĩ
                    </div>
                    {results.singers.map((singer) => (
                      <div
                        key={singer.singerId}
                        onClick={() => handleSelectSinger(singer)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-700/50 
                                  cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-700">
                          {singer.imageUrl ? (
                            <img
                              src={singer.imageUrl}
                              alt={singer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center 
                                            bg-gradient-to-br from-pink-500 to-purple-600">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{singer.name}</h4>
                          <p className="text-gray-400 text-sm">Nghệ sĩ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* 🎵 BÀI HÁT */}
                {results.songs && results.songs.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2 text-gray-400 text-sm font-semibold">
                      Bài hát
                    </div>
                    {results.songs.map((song) => (
                      <div
                        key={song.songId}
                        onClick={() => handleSelectSong(song)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-700/50 
                                   cursor-pointer transition-all group"
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                          <img
                            src={song.coverUrl || "/default-song.png"}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 
                                          group-hover:opacity-100 transition-opacity
                                          flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">
                            {song.title}
                          </h4>
                          <p className="text-gray-400 text-sm truncate">
                            {song.singerName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 🎸 THỂ LOẠI */}
                {results.genres && results.genres.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-gray-400 text-sm font-semibold">
                      Thể loại
                    </div>
                    {results.genres.map((genre) => (
                      <div
                        key={genre.genreId}
                        onClick={() => handleSelectGenre(genre)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-700/50 
                                   cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-12 flex-shrink-0 rounded-full 
                                        bg-gradient-to-br from-pink-500 to-purple-600 
                                        flex items-center justify-center">
                          <Disc3 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{genre.name}</h4>
                          <p className="text-gray-400 text-sm">Thể loại</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}