import { useState, useEffect, useRef } from "react";
import { Search, X, Music, User, Disc3, Album } from "lucide-react";
import { searchAll } from "../../services/songService";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ onSelectSong }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ 
    songs: [], 
    singers: [], 
    genres: [],
    albums: []
  });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setResults({ songs: [], singers: [], genres: [], albums: [] });
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchAll(searchQuery);
        
        console.log("🔍 Search response:", response);
        
        // ✅ FIX: Sửa lại cách lấy data
        // response structure: { success: true, data: { songs: [], singers: [], genres: [], albums: [] } }
        const resultData = response.data || {};

        setResults({
          songs: resultData.songs || [],
          singers: resultData.singers || [],
          genres: resultData.genres || [],
          albums: resultData.albums || []
        });
    
        setShowResults(true);
      } catch (error) {
        console.error("❌ Search error:", error);
        setResults({ songs: [], singers: [], genres: [], albums: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [searchQuery]);

  const handleSelectSong = (song) => {
    console.log("🎵 Song selected:", song);
    
    setShowResults(false);
    setSearchQuery("");
    
    if (!onSelectSong) {
      console.error("❌ onSelectSong callback không được truyền vào!");
      alert("Lỗi: Không thể phát nhạc. Component cha chưa truyền prop onSelectSong.");
      return;
    }

    if (!song.fileUrl) {
      console.error("❌ Bài hát không có fileUrl:", song);
      alert("Bài hát này không có file âm thanh!");
      return;
    }

    const formattedSong = {
      songId: song.songId,
      title: song.title,
      artist: song.singerName || "Unknown Artist",
      fileUrl: song.fileUrl,
      coverUrl: song.coverUrl,
      duration: song.duration,
    };

    console.log("✅ Formatted song:", formattedSong);
    
    try {
      onSelectSong(formattedSong);
      console.log("✅ onSelectSong callback executed successfully");
    } catch (error) {
      console.error("❌ Error calling onSelectSong:", error);
      alert("Có lỗi khi phát nhạc!");
    }
  };

  const handleSelectSinger = (singer) => {
    console.log("👤 Singer selected:", singer);
    setShowResults(false);
    setSearchQuery("");
    navigate(`/singer/${singer.singerId}`);
  };

  const handleSelectGenre = (genre) => {
    console.log("🎸 Genre selected:", genre);
    setShowResults(false);
    setSearchQuery("");
    navigate(`/genre/${genre.genreId}`);
  };

  const handleSelectAlbum = (album) => {
    console.log("💿 Album selected:", album);
    setShowResults(false);
    setSearchQuery("");
    navigate(`/album/${album.albumId}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults({ songs: [], singers: [], genres: [], albums: [] });
    setShowResults(false);
  };

  const hasResults = 
    results.songs?.length > 0 || 
    results.singers?.length > 0 || 
    results.genres?.length > 0 ||
    results.albums?.length > 0;

  return (
    <div className="w-full" ref={searchRef}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 
                         group-focus-within:text-white transition-colors" />
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Bạn muốn phát nội dung gì?"
          className="w-full pl-12 pr-12 py-3 rounded-full 
                     bg-[#242424] text-white text-sm font-medium
                     placeholder-gray-400
                     hover:bg-[#2a2a2a]
                     focus:outline-none focus:ring-2 focus:ring-white/10 focus:bg-[#2a2a2a]
                     transition-all duration-200"
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 
                       p-1 rounded-full hover:bg-white/10
                       text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 mt-2 
                        bg-[#282828] rounded-xl shadow-2xl 
                        max-h-[500px] overflow-hidden z-50">
          
          {loading ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 border-3 border-gray-600 border-t-white 
                              rounded-full animate-spin mx-auto"></div>
            </div>
          ) : !hasResults ? (
            <div className="p-10 text-center">
              <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Không tìm thấy kết quả</p>
              <p className="text-gray-500 text-sm mt-1">Hãy thử tìm kiếm khác</p>
            </div>
          ) : (
            <div className="py-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {/* NGHỆ SĨ */}
              {results.singers && results.singers.length > 0 && (
                <div className="mb-3">
                  <div className="px-4 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Nghệ sĩ
                  </div>
                  {results.singers.map((singer) => (
                    <div
                      key={singer.singerId}
                      onClick={() => handleSelectSinger(singer)}
                      className="flex items-center gap-3 px-4 py-3 
                                 hover:bg-[#3e3e3e] cursor-pointer 
                                 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1a1a] 
                                    flex-shrink-0 shadow-md">
                        {singer.imageUrl ? (
                          <img
                            src={singer.imageUrl}
                            alt={singer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate 
                                     group-hover:text-[#1ed760] transition-colors">
                          {singer.name}
                        </h4>
                        <p className="text-gray-400 text-xs">Nghệ sĩ</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ALBUM */}
              {results.albums && results.albums.length > 0 && (
                <div className="mb-3">
                  <div className="px-4 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Album
                  </div>
                  {results.albums.map((album) => (
                    <div
                      key={album.albumId}
                      onClick={() => handleSelectAlbum(album)}
                      className="flex items-center gap-3 px-4 py-3 
                                 hover:bg-[#3e3e3e] cursor-pointer 
                                 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded overflow-hidden bg-[#1a1a1a] 
                                    flex-shrink-0 shadow-md">
                        {album.coverUrl ? (
                          <img
                            src={album.coverUrl}
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600 to-red-600">
                            <Album className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate 
                                     group-hover:text-[#1ed760] transition-colors">
                          {album.title}
                        </h4>
                        <p className="text-gray-400 text-xs truncate">
                          {album.singerName || "Album"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* BÀI HÁT */}
              {results.songs && results.songs.length > 0 && (
                <div className="mb-3">
                  <div className="px-4 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Bài hát
                  </div>
                  {results.songs.map((song) => (
                    <div
                      key={song.songId}
                      onClick={() => handleSelectSong(song)}
                      className="flex items-center gap-3 px-4 py-3 
                                 hover:bg-[#3e3e3e] cursor-pointer 
                                 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded overflow-hidden bg-[#1a1a1a] 
                                    flex-shrink-0 shadow-md relative">
                        <img
                          src={song.coverUrl || "/default-song.png"}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 
                                      group-hover:opacity-100 transition-opacity
                                      flex items-center justify-center">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate 
                                     group-hover:text-[#1ed760] transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-gray-400 text-xs truncate">
                          {song.singerName}
                        </p>
                      </div>
                      {!song.fileUrl && (
                        <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
                          No audio
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* THỂ LOẠI */}
              {results.genres && results.genres.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Thể loại
                  </div>
                  {results.genres.map((genre) => (
                    <div
                      key={genre.genreId}
                      onClick={() => handleSelectGenre(genre)}
                      className="flex items-center gap-3 px-4 py-3 
                                 hover:bg-[#3e3e3e] cursor-pointer 
                                 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full 
                                    bg-gradient-to-br from-purple-600 to-pink-600 
                                    flex items-center justify-center flex-shrink-0 shadow-md">
                        <Disc3 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate 
                                     group-hover:text-[#1ed760] transition-colors">
                          {genre.name}
                        </h4>
                        <p className="text-gray-400 text-xs">Thể loại</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5a5a5a;
        }
      `}</style>
    </div>
  );
}