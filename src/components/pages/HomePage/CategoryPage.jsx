import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Play, Pause, Clock } from "lucide-react";

// Components
import SearchBar from "../../elements/SearchBar";
import MusicPlayerBar from "../../elements/MusicPlayerBar";
import AddToPlaylistButton from "../../elements/AddToPlaylistButton";
import LikeButton from "../../elements/LikeButton";
import Notification from "../../elements/Notification";

// Services
import { 
  getSongsBySinger, 
  getSongsByGenre, 
  getSongsByAlbum,
  getSingerById,
  getGenreById,
  getAlbumById
} from "../../../services/songService";
import { getUserFavorites } from "../../../services/favoriteService";

// Contexts
import { useAuth } from "../../providers/AuthContext";
import { usePlayer } from "../../providers/PlayerContext";

export default function CategoryPage() {
  // ==================== CONTEXTS ====================
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause, audioRef } = usePlayer();
  
  // ==================== ROUTER ====================
  const { id } = useParams();
  const location = useLocation();
  
  // ==================== STATE ====================
  const [songs, setSongs] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // ==================== HELPERS ====================
  const getPageType = () => {
    if (location.pathname.includes('/singer')) return 'singer';
    if (location.pathname.includes('/genre')) return 'genre';
    if (location.pathname.includes('/album')) return 'album';
    return null;
  };
  
  const type = getPageType();

  const formatDuration = (seconds) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show notification helper
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let songsData;
        let categoryData;
        
        if (type === "singer") {
          songsData = await getSongsBySinger(id);
          categoryData = await getSingerById(id);
        } else if (type === "genre") {
          songsData = await getSongsByGenre(id);
          categoryData = await getGenreById(id);
        } else if (type === "album") {
          songsData = await getSongsByAlbum(id);
          categoryData = await getAlbumById(id);
        }
        
        setSongs(songsData || []);
        
        if (categoryData) {
          setCategoryInfo({
            name: categoryData.name || categoryData.title,
            imageUrl: categoryData.imageUrl || categoryData.coverUrl,
            type: type === 'singer' ? 'Nghệ sĩ' : type === 'genre' ? 'Thể loại' : 'Album',
            description: categoryData.bio || categoryData.description || '',
            singerName: categoryData.singerName || ''
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSongs([]);
        showNotification('error', 'Không thể tải dữ liệu!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, showNotification]);

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

  const handlePlaySong = useCallback((song) => {
    const formattedSong = {
      songId: song.songId,
      title: song.title,
      artist: song.singerName,
      fileUrl: song.fileUrl,
      coverUrl: song.coverUrl,
      duration: song.duration,
    };
    play(formattedSong);
  }, [play]);

  const handlePlayAll = useCallback(() => {
    if (songs.length > 0) {
      const firstSong = {
        songId: songs[0].songId,
        title: songs[0].title,
        artist: songs[0].singerName,
        fileUrl: songs[0].fileUrl,
        coverUrl: songs[0].coverUrl,
        duration: songs[0].duration,
      };
      play(firstSong);
      showNotification('success', 'Đang phát toàn bộ danh sách!');
    }
  }, [songs, play, showNotification]);

  const handleLikeChange = useCallback((songId, newLiked) => {
    setFavoriteSongs((prev) =>
      newLiked ? [...prev, songId] : prev.filter((id) => id !== songId)
    );
    
    if (newLiked) {
      showNotification('success', 'Đã thêm vào yêu thích! ❤️');
    } else {
      showNotification('warning', 'Đã bỏ yêu thích');
    }
  }, [showNotification]);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="flex flex-col w-full h-full">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ========== TOP NAVIGATION BAR ========== */}
      <div className="sticky top-0 z-50 bg-[#121212] px-6 py-4">
        <SearchBar onSelectSong={handleSelectSongFromSearch} />
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Category Header */}
        {categoryInfo && (
          <div className="relative bg-gradient-to-b from-gray-800 to-[#121212] px-6 pt-6 pb-8">
            <div className="flex items-end gap-6 mb-6">
              {/* Image */}
              <div className="w-56 h-56 rounded-lg shadow-2xl flex-shrink-0 overflow-hidden bg-gray-700">
                {categoryInfo.imageUrl ? (
                  <img
                    src={categoryInfo.imageUrl}
                    alt={categoryInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-6xl font-bold">
                    {categoryInfo.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 pb-4">
                <p className="text-sm text-white font-bold uppercase tracking-wider mb-2">
                  {categoryInfo.type}
                </p>
                <h1 className="text-7xl font-black text-white mb-6 leading-tight">
                  {categoryInfo.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-white">
                  {categoryInfo.singerName && (
                    <>
                      <span className="font-semibold">{categoryInfo.singerName}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="font-semibold">{songs.length} bài hát</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="px-6 py-6 bg-gradient-to-b from-[#121212]/50 to-[#121212]">
          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                     flex items-center justify-center text-black transition-all
                     hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-7 h-7 ml-1" fill="currentColor" />
          </button>
        </div>

        {/* Songs List */}
        {songs.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-gray-300 text-xl font-semibold mb-2">
              Không có bài hát nào
            </p>
            <p className="text-gray-500 text-sm">
              {type === 'album' && 'Album này chưa có bài hát'}
              {type === 'singer' && 'Nghệ sĩ này chưa có bài hát'}
              {type === 'genre' && 'Thể loại này chưa có bài hát'}
            </p>
          </div>
        ) : (
          <div className="px-6">
            {/* Table Header */}
            <div className="grid grid-cols-[16px_1fr_minmax(150px,1fr)] gap-4 px-4 py-2 
                          text-sm text-gray-400 uppercase tracking-wider border-b border-gray-800">
              <div className="text-center">#</div>
              <div>Tiêu đề</div>
              <div className="flex justify-end items-center gap-2">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {/* Table Body */}
            <div className="mt-2">
              {songs.map((song, index) => {
                const isCurrentSong = currentTrack?.songId === song.songId;
                const isSongPlaying = isCurrentSong && isPlaying;
                const isFavorited = favoriteSongs.includes(song.songId);
                const isHovered = hoveredRow === index;

                return (
                  <div
                    key={song.songId}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`grid grid-cols-[16px_1fr_minmax(150px,1fr)] gap-4 px-4 py-2 
                              rounded-md group hover:bg-white/10 transition-colors cursor-pointer
                              ${isCurrentSong ? 'bg-white/5' : ''}`}
                  >
                    {/* Number / Play Icon */}
                    <div className="flex items-center justify-center text-gray-400">
                      {isHovered || isSongPlaying ? (
                        <button
                          onClick={() => isSongPlaying ? pause() : handlePlaySong(song)}
                          className="w-4 h-4 flex items-center justify-center"
                        >
                          {isSongPlaying ? (
                            <Pause className="w-4 h-4 text-white" fill="white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" fill="white" />
                          )}
                        </button>
                      ) : (
                        <span className={`text-sm ${isCurrentSong ? 'text-green-500' : ''}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Title & Artist */}
                    <div 
                      className="flex items-center gap-3 min-w-0"
                      onClick={() => handlePlaySong(song)}
                    >
                      <img
                        src={song.coverUrl || "/default-song.png"}
                        alt={song.title}
                        className="w-10 h-10 rounded flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {song.singerName}
                        </div>
                      </div>
                    </div>

                    {/* Duration & Actions */}
                    <div className="flex items-center justify-end gap-3">
                      {/* Add to Playlist */}
                      <div 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AddToPlaylistButton 
                          song={song}
                          onSuccess={(playlistName) => 
                            showNotification('success', `Đã thêm "${song.title}" vào ${playlistName}! 🎵`)
                          }
                        />
                      </div>

                      {/* Like Button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <LikeButton
                          userId={user?.userId}
                          songId={song.songId}
                          initialLiked={isFavorited}
                          onChange={(newLiked) => handleLikeChange(song.songId, newLiked)}
                        />
                      </div>

                      {/* Duration */}
                      <span className="text-sm text-gray-400 w-12 text-right">
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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