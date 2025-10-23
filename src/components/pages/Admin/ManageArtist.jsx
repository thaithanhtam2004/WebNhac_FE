import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import ArtistForm from "../../ui/Admin/Artist/ArtistForm";
import {
  getAllSingers,
  createSinger,
  updateSinger,
  deleteSinger,
} from "../../../services/singerService"; // import service

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editArtist, setEditArtist] = useState(null);

  // 🟢 Lấy danh sách ca sĩ khi load page
  const fetchArtists = async () => {
    try {
      const res = await getAllSingers();
      if (res.success) {
        // map backend data sang FE data
        const mapped = res.data.map((a) => ({
          singerId: a.singerId,
          name: a.name,
          description: a.bio, // backend bio -> FE description
          avatar: a.imageUrl, // backend imageUrl -> FE avatar
          country: a.country || "", // nếu có trường country
        }));
        console.log("Dữ liệu ca sĩ:", mapped);
        setArtists(mapped);
      }
    } catch (err) {
      console.error("Lấy ca sĩ lỗi:", err);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleAdd = () => {
    setEditArtist(null);
    setOpenForm(true);
  };

  const handleEdit = (artist) => {
    setEditArtist(artist);
    setOpenForm(true);
  };

  const handleDelete = async (singerId) => {
    if (!singerId) return console.error("Không có ID để xóa!");
    try {
      const res = await deleteSinger(singerId);
      if (res.success) {
        setArtists(artists.filter((a) => a.singerId !== singerId));
      }
    } catch (err) {
      console.error("Xóa ca sĩ lỗi:", err);
    }
  };

  // 🔹 Xử lý submit từ ArtistForm
  const handleFormSubmit = async (artistData) => {
    // map FE data -> backend data
    const dataToSend = {
      name: artistData.name,
      bio: artistData.description,
      imageUrl:
        artistData.avatar instanceof File ? null : artistData.avatar || null,
      country: artistData.country || "",
    };

    try {
      if (editArtist) {
        // cập nhật
        const res = await updateSinger(editArtist.singerId, dataToSend);
        if (res.success) {
          setArtists(
            artists.map((a) =>
              a.singerId === editArtist.singerId ? { ...a, ...artistData } : a
            )
          );
        }
      } else {
        // thêm mới
        const res = await createSinger(dataToSend);
        if (res.success) fetchArtists(); // load lại danh sách
      }
      setOpenForm(false);
    } catch (err) {
      console.error("Lưu ca sĩ lỗi:", err);
    }
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý ca sĩ</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
        >
          <Plus size={18} /> Thêm ca sĩ
        </button>
      </div>

      {/* Danh sách ca sĩ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div
            key={artist.singerId} // ✅ dùng singerId làm key
            className="bg-[#1a1a1a] rounded-xl shadow-lg p-4 flex flex-col items-center"
          >
            <img
              src={artist.avatar || "/default-avatar.png"}
              alt={artist.name}
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
            <h3 className="text-lg font-semibold">{artist.name}</h3>
            <p className="text-sm text-gray-400">{artist.country}</p>
            <p className="text-xs text-gray-500 text-center mt-2 line-clamp-2">
              {artist.description}
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleEdit(artist)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(artist.singerId)}
                className="p-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form thêm/sửa */}
      {openForm && (
        <ArtistForm
          isEdit={!!editArtist}
          artist={editArtist}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit} // 🔹 kết nối form với API
        />
      )}
    </div>
  );
};

export default Artists;
