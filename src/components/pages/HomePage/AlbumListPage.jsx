import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAlbums } from "../../../services/albumService";
import AlbumCard from "../../elements/AlbumCard";
import SectionAlbum from "../../elements/SectionAlbum";

export default function AlbumListPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await getAllAlbums();
        const albumArray = Array.isArray(data) ? data : [];

        // Sắp xếp theo số trong albumId
        const sortedAlbums = albumArray.sort((a, b) => {
          const numA = parseInt(a.albumId.replace("album_", ""));
          const numB = parseInt(b.albumId.replace("album_", ""));
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

  if (loading) return <p className="text-white">Đang tải danh sách album...</p>;
  if (albums.length === 0)
    return <p className="text-white">Chưa có album nào.</p>;

  return (
    <div className="p-6">
      <SectionAlbum
        title="Tất cả Album"
        data={albums}
        renderItem={(album) => (
          <AlbumCard
            key={album.albumId}
            title={album.name}
            artist={album.singerName} // hiển thị tên ca sĩ thay vì ID
            cover={album.coverUrl}
            onClick={() => navigate(`/albums/${album.albumId}`)}
          />
        )}
      />
    </div>
  );
}
