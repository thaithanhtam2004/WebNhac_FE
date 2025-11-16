import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// Components
import Section from "../../elements/Section";
import MusicCard from "../../elements/MusicCard";
import AlbumCard from "../../elements/AlbumCard";
import SearchBar from "../../elements/SearchBar";
import MusicPlayerBar from "../../elements/MusicPlayerBar";

// Hooks
import { useGetSongByReleaseDate } from "../../../hooks/useGetSongByReleaseDate";
import { useGetHotTrendSong } from "../../../hooks/useGetHotTrendSong";
import { useRecommendations } from "../../../hooks/useGetUserRecommendations";

// Services
import { getAllAlbums } from "../../../services/albumService";
import { getUserFavorites } from "../../../services/favoriteService";

// Contexts
import { useAuth } from "../../providers/AuthContext";
import { usePlayer } from "../../providers/PlayerContext";

export default function HomePage() {
  // ==================== CONTEXTS ====================
  const { user, logout } = useAuth();
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  // ==================== EFFECTS ====================
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
        console.error("Error fetching albums:", err);
      } finally {
        setLoadingAlbums(false);
      }
    };
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      try {
        const favs = await getUserFavorites(user.userId);
        setFavoriteSongs(favs.map((s) => s.songId));
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };
    fetchFavorites();
  }, [user]);

  // ==================== HANDLERS ====================
  const handleSelectSongFromSearch = useCallback((song) => {
    play(song);
  }, [play]);

  const handleLikeChange = useCallback((songId, newLiked) => {
    setFavoriteSongs((prev) =>
      newLiked ? [...prev, songId] : prev.filter((id) => id !== songId)
    );
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleLogin = useCallback(() => {
    navigate("/auth/login");
  }, [navigate]);

  // ==================== RENDER HELPERS ====================
  const renderMusicCard = useCallback((song) => (
    <MusicCard
      key={song.songId}
      song={song}
      currentTrack={currentTrack}
      isPlaying={isPlaying && currentTrack?.songId === song.songId}
      userId={user?.userId}
      initialLiked={favoriteSongs.includes(song.songId)}
      onLikeChange={(newLiked) => handleLikeChange(song.songId, newLiked)}
      onPlay={() => play(song)}
      onPause={pause}
    />
  ), [currentTrack, isPlaying, user?.userId, favoriteSongs, handleLikeChange, play, pause]);

  const renderAlbumCard = useCallback((album) => (
    <AlbumCard
      key={album.albumId}
      title={album.name}
      artist={album.singerName}
      coverUrl={album.coverUrl}
      onClick={() => navigate(`/albums/${album.albumId}`)}
    />
  ), [navigate]);

  // ==================== RENDER ====================
  return (
    <div className="flex flex-col w-full h-full">
      {/* ========== TOP NAVIGATION BAR - OPTIMIZED ========== */}
      <div className="sticky top-0 z-50 bg-[#121212] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar - Flex Grow */}
          <div className="flex-1 max-w-2xl">
            <SearchBar onSelectSong={handleSelectSongFromSearch} />
          </div>

          {/* User Actions - Fixed Width */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                <div className="px-4 py-2 bg-black/40 rounded-full">
                  <span className="text-white text-sm font-semibold whitespace-nowrap">
                    Xin chào, {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-black text-sm font-bold 
                             rounded-full hover:scale-105 transition-transform whitespace-nowrap"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-6 py-2.5 bg-white text-black text-sm font-bold 
                           rounded-full hover:scale-105 transition-transform whitespace-nowrap"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6">
        {/* Content Sections */}
        <div className="space-y-8">
          {/* Recommendations */}
          {user && (
            <Section
              title="Dành riêng cho bạn"
              useFetchHook={() => useRecommendations(user.userId)}
              renderItem={renderMusicCard}
            />
          )}

          {/* Hot Trend */}
          <Section
            title="Xu hướng hôm nay"
            useFetchHook={useGetHotTrendSong}
            renderItem={renderMusicCard}
          />

          {/* New Releases */}
          <Section
            title="Mới phát hành"
            useFetchHook={useGetSongByReleaseDate}
            renderItem={renderMusicCard}
            headerRight={
              <Link
                to="/latest"
                className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Hiển thị tất cả
              </Link>
            }
          />

          {/* Latest Albums */}
          <Section
            title="Album mới"
            useFetchHook={() => ({
              data: albums.slice(0, 5),
              isLoading: loadingAlbums,
              error: null
            })}
            renderItem={renderAlbumCard}
            headerRight={
              <Link
                to="/albums"
                className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Hiển thị tất cả
              </Link>
            }
          />
        </div>
      </div>

      {/* ========== MUSIC PLAYER BAR ========== */}
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