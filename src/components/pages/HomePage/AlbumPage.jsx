import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../providers/AuthContext";
import { usePlayer } from "../../providers/PlayerContext";
import PlayButton from "../../elements/playButton";
import LikeButton from "../../elements/LikeButton";
import AddToPlaylistButton from "../../elements/AddToPlaylistButton";
import { getAlbumById } from "../../../services/albumService";
import { getSongsOfAlbum } from "../../../services/albumSongService";
import { getUserFavorites } from "../../../services/favoriteService";

export default function AlbumPage() {
  const { albumId } = useParams();
  const { user } = useAuth();
  const { currentTrack, isPlaying, play, pause } = usePlayer();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Fetch album + songs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const alb = await getAlbumById(albumId);
        setAlbum(alb || null);

        const songsData = await getSongsOfAlbum(albumId);
        setSongs(songsData || []);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải album!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [albumId]);

  // Fetch favorite songs
  useEffect(() => {
    if (!user) return;
    getUserFavorites(user.userId)
      .then(f => setFavoriteIds(f.map(item => item.songId)))
      .catch(console.error);
  }, [user]);

  const handlePlayAll = () => {
    if (!songs.length) return;
    play(songs[0]);
    toast(`▶️ Đang phát tất cả: ${album?.title}`, { icon: "🎵" });
  };

  if (loading)
    return <p className="text-white text-center mt-10">Đang tải album...</p>;
  if (!album)
    return <p className="text-white text-center mt-10">Album không tồn tại.</p>;

  return (
    <div className="flex gap-6 h-full">
      {/* Cột trái: ảnh + thông tin */}
      <div className="flex flex-col gap-4 w-64 flex-shrink-0">
        <img
          src={album.coverUrl || "/default-cover.jpg"}
          alt={album.title}
          className="w-full h-64 rounded-xl object-cover shadow-lg"
        />

        <div className="flex flex-col gap-2">
          <button
            onClick={handlePlayAll}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg w-full hover:bg-cyan-500/40 transition"
          >
            Phát tất cả
          </button>

          <h2 className="text-2xl font-bold text-white">{album.title}</h2>
          <p className="text-gray-400">{album.artist}</p>
          <p className="text-gray-400">Số bài hát: {songs.length}</p>
          <p className="text-gray-400">Ngày phát hành: {album.releaseDate}</p>
        </div>
      </div>

      {/* Cột phải: danh sách bài hát scroll */}
      <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 flex flex-col overflow-hidden">
        {songs.length === 0 ? (
          <p className="text-gray-400 text-center py-10 flex-1">
            Chưa có bài hát nào.
          </p>
        ) : (
          <ul className="divide-y divide-gray-800 overflow-y-auto flex-1">
            {songs.map((song, index) => (
              <li
                key={song.songId}
                className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-gray-400">{index + 1}</span>
                  <img
                    src={song.coverUrl || "/default-cover.jpg"}
                    alt={song.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-white">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {song.singerName || song.artist}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PlayButton
                    variant="simple"
                    song={song}
                    isCurrent={currentTrack?.songId === song.songId}
                    isPlaying={
                      currentTrack?.songId === song.songId && isPlaying
                    }
                    onPlay={() => play(song)}
                    onPause={() => pause()}
                  />

                  <AddToPlaylistButton song={song} />

                  <LikeButton
                    userId={user?.userId}
                    songId={song.songId}
                    initialLiked={favoriteIds.includes(song.songId)}
                    onChange={(newLiked) =>
                      setFavoriteIds((prev) =>
                        newLiked
                          ? [...prev, song.songId]
                          : prev.filter((id) => id !== song.songId)
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>

      {/* Section gợi ý album khác */}
      {albums.length > 1 && (
        <Section
          title="Album liên quan"
          data={albums.filter((a) => a.albumId !== album.albumId)}
          renderItem={(a) => (
            <AlbumCard
              key={a.albumId}
              title={a.name}
              artist={a.singerName || a.singerId}
              cover={a.coverUrl}
              onClick={() => navigate(`/albums/${a.albumId}`)} // click chuyển album
            />
          )}
        />
      )}
    </div>
  );
}
