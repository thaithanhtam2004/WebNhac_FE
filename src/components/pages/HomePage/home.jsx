import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Section from "../../elements/Section";
import MusicCard from "../../elements/MusicCard";
import AlbumCard from "../../elements/AlbumCard";
import { useGetAllSong } from "../../../hooks/useGetAllSong";
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";
import { getAllAlbums } from "../../../services/albumService";
import { getUserFavorites } from "../../../services/favoriteService";
import MusicPlayerBar from "../../elements/MusicPlayerBar";
import { useAuth } from "../../providers/AuthContext";
import { LogOut } from "lucide-react";

// ✅ Import PlayerContext
import { usePlayer } from "../../providers/PlayerContext";

export default function HomePage() {
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ✅ lấy album
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await getAllAlbums();
        const sorted = Array.isArray(data)
          ? data.sort(
              (a, b) =>
                parseInt(a.albumId.replace("album_", "")) -
                parseInt(b.albumId.replace("album_", ""))
            )
          : [];
        setAlbums(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlbums(false);
      }
    };
    fetchAlbums();
  }, []);

  // ✅ list bài hát yêu thích của user
  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      try {
        const favs = await getUserFavorites(user.userId);
        setFavoriteSongs(favs.map((s) => s.songId));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavorites();
  }, [user]);

  return (
    <div className="flex flex-col w-full h-full text-white p-4 sm:p-6 overflow-y-auto">

      {/* ✅ user info */}
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

      {/* ✅ Section TẤT CẢ BÀI HÁT */}
      <Section
        title="TẤT CẢ BÀI HÁT"
        useFetchHook={useGetAllSong}
        renderItem={(song, index) =>
          index < 5 && (
            <MusicCard
  song={song}
  currentTrack={currentTrack}   // ✅ thêm dòng này
  isPlaying={isPlaying && currentTrack?.songId === song.songId}
  initialLiked={favoriteSongs.includes(song.songId)}
  onPlay={() => play(song)}
  onPause={pause}
/>

          )
        }
        headerRight={
          <Link to="/songs" className="text-white hover:text-cyan-300 font-semibold text-sm transition">
            Tất cả
          </Link>
        }
      />

      {/* ✅ Section: Mới phát hành */}
      <Section
        title="MỚI PHÁT HÀNH"
        useFetchHook={useGetSongByReleaseDate}
        renderItem={(song) => (
                    <MusicCard
  song={song}
  currentTrack={currentTrack}   // ✅ thêm dòng này
  isPlaying={isPlaying && currentTrack?.songId === song.songId}
  initialLiked={favoriteSongs.includes(song.songId)}
  onPlay={() => play(song)}
  onPause={pause}
/>

        )}
        headerRight={
          <Link to="/latest" className="text-white hover:text-cyan-300 font-semibold text-sm transition">
            Tất cả
          </Link>
        }
      />

      {/* ✅ ALBUM */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">ALBUM MỚI NHẤT</h2>
          <Link to="/albums" className="text-white hover:text-cyan-300 font-semibold text-sm transition">
            Tất cả
          </Link>
        </div>

        {loadingAlbums ? (
          <p>Đang tải album...</p>
        ) : albums.length === 0 ? (
          <p>Chưa có album nào.</p>
        ) : (
          <div className="flex flex-wrap justify-between gap-4">
            {albums.slice(0, 5).map((album) => (
              <div key={album.albumId} className="flex-1 min-w-[180px] max-w-[220px]">
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

      {/* ✅ Global Music Player Bar */}
      {currentTrack && (
        <MusicPlayerBar
          tracks={[currentTrack]}
          isPlaying={isPlaying}
  onPlayPause={(state) => (state ? play(currentTrack) : pause())}

          audioRef={audioRef}
        />
      )}
    </div>
  );
}
