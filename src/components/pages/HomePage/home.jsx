import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Section from "../../elements/Section";
import MusicCard from "../../elements/MusicCard";
import AlbumCard from "../../elements/AlbumCard";
import SearchBar from "../../elements/SearchBar";
import { useGetAllSong } from "../../../hooks/useGetAllSong";
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";
import { getAllAlbums } from "../../../services/albumService";
import { getUserFavorites } from "../../../services/favoriteService";
import MusicPlayerBar from "../../elements/MusicPlayerBar";
import { useAuth } from "../../providers/AuthContext";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Lấy album
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await getAllAlbums();
        const sorted = Array.isArray(data) ? data.sort(
          (a, b) => parseInt(a.albumId.replace("album_", "")) - parseInt(b.albumId.replace("album_", ""))
        ) : [];
        setAlbums(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlbums(false);
      }
    };
    fetchAlbums();
  }, []);

  // Lấy bài hát yêu thích nếu user login
  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      try {
        const favs = await getUserFavorites(user.userId);
        setFavoriteSongs(favs.map(song => song.songId));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavorites();
  }, [user]);

  // Xử lý chọn bài hát từ SearchBar
  const handleSelectSongFromSearch = (song) => {
    console.log("Selected song from search:", song);
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col w-full h-full text-white relative">
      {/* SearchBar - sticky ở top */}
      <div className="sticky top-0 z-50">
        <SearchBar onSelectSong={handleSelectSongFromSearch} />
      </div>

      {/* Nội dung chính - có thể scroll */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1">
        {/* User info */}
        <div className="flex justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-cyan-300">{user.name}</span>
              <button 
                onClick={logout} 
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-lg transition flex items-center gap-1"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/auth/login")} 
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-1 rounded-lg transition"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Section: Tất cả bài hát */}
        <Section
          title="TẤT CẢ BÀI HÁT"
          useFetchHook={useGetAllSong}
          renderItem={(song, index) =>
            index < 5 && (
              <MusicCard
                key={song.songId}
                songId={song.songId}
                userId={user?.userId}
                title={song.title}
                artist={song.artist}
                trackPath={song.fileUrl}
                initialLiked={favoriteSongs.includes(song.songId)}
                onPlay={() => {
                  console.log("Selected track:", song);
                  console.log("Track URL:", song.fileUrl);
                  setCurrentTrack(song);
                  setIsPlaying(true);
                }}
              />
            )
          }
          headerRight={
            <Link 
              to="/songs" 
              className="text-white hover:text-cyan-300 font-semibold text-sm transition"
            >
              Tất cả
            </Link>
          }
        />

        {/* Section: Mới phát hành */}
        <Section
          title="MỚI PHÁT HÀNH"
          useFetchHook={useGetSongByReleaseDate}
          renderItem={(song) => (
            <MusicCard
              key={song.songId}
              songId={song.songId}
              userId={user?.userId}
              title={song.title}
              artist={song.artist}
              trackPath={song.fileUrl}
              initialLiked={favoriteSongs.includes(song.songId)}
              onPlay={() => {
                console.log("Selected track:", song);
                console.log("Track URL:", song.fileUrl);
                setCurrentTrack(song);
                setIsPlaying(true);
              }}
            />
          )}
          headerRight={
            <Link 
              to="/latest" 
              className="text-white hover:text-cyan-300 font-semibold text-sm transition"
            >
              Tất cả
            </Link>
          }
        />

        {/* Section: Album */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">ALBUM MỚI NHẤT</h2>
            <Link 
              to="/albums" 
              className="text-white hover:text-cyan-300 font-semibold text-sm transition"
            >
              Tất cả
            </Link>
          </div>
          {loadingAlbums ? (
            <p>Đang tải album...</p>
          ) : albums.length === 0 ? (
            <p>Chưa có album nào.</p>
          ) : (
            <div className="flex flex-wrap justify-between gap-4">
              {albums.slice(0, 5).map(album => (
                <div 
                  key={album.albumId} 
                  className="flex-1 min-w-[180px] max-w-[220px]"
                >
                  <AlbumCard
                    title={album.name}
                    artist={album.singerName}
                    coverUrl={album.coverUrl}
                    onClick={() => navigate(`/albums/${album.albumId}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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