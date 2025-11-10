import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, ListPlus, Play } from "lucide-react";
import { getAlbumById, getAllAlbums } from "../../../services/albumService";
import AlbumCard from "../../elements/AlbumCard";
import Section from "../../elements/Section";

export default function AlbumPage() {
  const navigate = useNavigate();
  const { albumId } = useParams(); // Lấy albumId từ URL

  const [album, setAlbum] = useState(null);
  const [albums, setAlbums] = useState([]); // Dùng cho "Album liên quan"
  const [loading, setLoading] = useState(true);

  // Lấy tất cả album khi mount component
  useEffect(() => {
    getAllAlbums()
      .then((res) => setAlbums(res.data || []))
      .catch((err) => console.error("Lỗi khi lấy danh sách album:", err));
  }, []);

  // Hàm lấy album theo ID
  const fetchAlbum = async (id) => {
    setLoading(true);
    try {
      const data = await getAlbumById(id);
      setAlbum(data);
    } catch (err) {
      console.error("Lỗi khi lấy album:", err);
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  };

  // Load album mỗi khi albumId thay đổi
  useEffect(() => {
    if (albumId) fetchAlbum(albumId);
  }, [albumId]);

  if (loading) return <p className="text-white">Đang tải album...</p>;
  if (!album) return <p className="text-white">Không tìm thấy album</p>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Thông tin album */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-4 w-full md:w-64">
          <img
            src={
              album.coverUrl?.startsWith("http")
                ? album.coverUrl
                : `http://localhost:3000${album.coverUrl}`
            }
            alt={album.name}
            className="w-full h-64 rounded-xl object-cover shadow-lg"
          />

          <div className="flex flex-col gap-2">
            <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg w-full hover:bg-cyan-500/40 transition">
              Phát tất cả
            </button>

            <h2 className="text-2xl font-bold text-white">{album.name}</h2>
            <p className="text-gray-400">
              Ca sĩ: {album.singerName || album.singerId}
            </p>
            <p className="text-gray-400">
              Lượt nghe: {album.totalViews?.toLocaleString() || 0}
            </p>
            <p className="text-gray-400">
              Ngày phát hành:{" "}
              {album.releaseDate
                ? new Date(album.releaseDate).toLocaleDateString("vi-VN")
                : "Chưa cập nhật"}
            </p>
            <p className="text-gray-400 line-clamp-3">{album.description}</p>
          </div>
        </div>

        {/* Danh sách bài hát */}
        <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 shadow-inner shadow-black/40 max-h-[520px] overflow-y-auto">
{album.songs && album.songs.length > 0 ? (
            <ul className="divide-y divide-gray-800">
              {album.songs.map((song, index) => (
                <li
                  key={song.id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-[#2a2a2a] rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-gray-400">{index + 1}</span>
                    <img
                      src={song.coverUrl || album.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-base font-semibold text-white">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-pink-500 cursor-pointer" />
                    <ListPlus className="w-5 h-5 text-cyan-400 cursor-pointer" />
                    <span className="text-gray-400">{song.duration}</span>
                    <button className="p-2 bg-cyan-500/20 rounded-full hover:bg-cyan-500/40 transition">
                      <Play className="w-5 h-5 text-cyan-400" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Album này chưa có bài hát.</p>
          )}
        </div>
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