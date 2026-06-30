import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAlbums } from "../../services/albumService";
import AlbumCard from "../../components/music/AlbumCard";

export default function AlbumListPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await getAllAlbums();
        const albumArray = Array.isArray(data) ? data : [];

        // Sắp xếp theo số thứ tự trong albumId
        const sortedAlbums = albumArray.sort((a, b) => {
          const numA = parseInt(a.albumId.replace("album_", "")) || 0;
          const numB = parseInt(b.albumId.replace("album_", "")) || 0;
          return numA - numB;
        });

        setAlbums(sortedAlbums);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách album:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  if (loading)
    return (
      <p className="text-white text-center mt-10">
        Đang tải danh sách album...
      </p>
    );

  if (albums.length === 0)
    return <p className="text-white text-center mt-10">Chưa có album nào.</p>;

  return (
    <div className="p-6">
      <h2 className="text-white text-xl font-semibold mb-6">Tất cả Album</h2>

      {/* 🟢 Lưới hiển thị album - tự co giãn đều, giống MusicCard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {albums.map((album) => (
          <AlbumCard
            key={album.albumId}
            title={album.name}
            artist={album.singerName}
            coverUrl={album.coverUrl}
            trackCount={album.trackCount}
            releaseDate={album.releaseDate}
            onClick={() => navigate(`/albums/${album.albumId}`)}
          />
        ))}
      </div>
    </div>
  );
}
