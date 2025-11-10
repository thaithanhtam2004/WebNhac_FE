import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getSongsBySinger, getSongsByGenre } from "../../../services/songService";
import SearchBar from "../../elements/SearchBar";
import MusicCard from "../../elements/MusicCard";
import MusicPlayerBar from "../../elements/MusicPlayerBar";
import { User, Disc3 } from "lucide-react";

export default function CategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  
  const type = location.pathname.includes('/singer') ? 'singer' : 'genre';
  
  const [songs, setSongs] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        if (type === "singer") {
          data = await getSongsBySinger(id);
        } else if (type === "genre") {
          data = await getSongsByGenre(id);
        }
        
        setSongs(data);
        
        if (data.length > 0) {
          setCategoryInfo({
            name: type === "singer" ? data[0].singerName : data[0].genreName,
            type: type === "singer" ? "Nghệ sĩ" : "Thể loại"
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  const handleSelectSongFromSearch = (song) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full text-white">
      {/* SearchBar - sticky ở top */}
      <div className="sticky top-0 z-50">
        <SearchBar onSelectSong={handleSelectSongFromSearch} />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header với icon và tên */}
        {categoryInfo && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              {type === "singer" ? (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 
                                flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 
                                flex items-center justify-center">
                  <Disc3 className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">{categoryInfo.type}</p>
                <h1 className="text-4xl font-bold">{categoryInfo.name}</h1>
              </div>
            </div>
            <p className="text-gray-400 ml-20">
              {songs.length} bài hát
            </p>
          </div>
        )}

        {/* ✅ Danh sách bài hát - KHÔNG dùng Section component */}
        {songs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Không có bài hát nào</p>
          </div>
        ) : (
          <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Tất cả bài hát</h2>
            </div>

            {/* Grid bài hát */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {songs.map((song) => (
                <MusicCard
                  key={song.songId}
                  title={song.title}
                  artist={song.singerName}
                  trackPath={song.fileUrl}
                  coverUrl={song.coverUrl}
                  onPlay={() => {
                    const formattedSong = {
                      songId: song.songId,
                      title: song.title,
                      artist: song.singerName,
                      fileUrl: song.fileUrl,
                      coverUrl: song.coverUrl,
                      duration: song.duration,
                    };
                    setCurrentTrack(formattedSong);
                    setIsPlaying(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Music Player Bar */}
      {currentTrack && (
        <MusicPlayerBar
          tracks={[currentTrack]}
          isPlaying={isPlaying}
          onPlayPause={setIsPlaying}
        />
      )}
    </div>
  );
}