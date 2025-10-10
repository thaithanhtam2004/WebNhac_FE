// src/components/pages/Admin/Artists.jsx
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import ArtistForm from "../../ui/Admin/Artist/ArtistForm";

const dummyArtists = [
  { id: 1, name: "Sơn Tùng M-TP", country: "Việt Nam", description: "Ca sĩ nổi tiếng Vpop", avatar: "/sontung.jpg" },
  { id: 2, name: "IU", country: "Hàn Quốc", description: "Nữ ca sĩ kiêm diễn viên", avatar: "/iu.jpg" },
];

const Artists = () => {
  const [artists, setArtists] = useState(dummyArtists);
  const [openForm, setOpenForm] = useState(false);
  const [editArtist, setEditArtist] = useState(null);

  const handleAdd = () => {
    setEditArtist(null);
    setOpenForm(true);
  };

  const handleEdit = (artist) => {
    setEditArtist(artist);
    setOpenForm(true);
  };

  const handleDelete = (id) => {
    setArtists(artists.filter((a) => a.id !== id));
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
            key={artist.id}
            className="bg-[#1a1a1a] rounded-xl shadow-lg p-4 flex flex-col items-center"
          >
            <img
              src={artist.avatar}
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
                onClick={() => handleDelete(artist.id)}
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
        />
      )}
    </div>
  );
};

export default Artists;
