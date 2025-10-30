// 📁 src/services/playlistService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/playlists";

// 🟢 Lấy tất cả playlist của user
export const getPlaylistsByUser = async (userId) => {
  try {
    const res = await axios.get(`${API_URL}?userId=${userId}`);
    return res.data.data; // ✅ lấy đúng data từ response
  } catch (err) {
    console.error("❌ Lỗi getPlaylistsByUser:", err);
    return [];
  }
};

// 🟢 Tạo playlist mới
export const createPlaylist = async (playlistData) => {
  try {
    const res = await axios.post(API_URL, playlistData);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi createPlaylist:", err);
    throw err;
  }
};

// 🟡 Cập nhật tên playlist
export const updatePlaylist = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi updatePlaylist:", err);
    throw err;
  }
};

// 🔴 Xóa playlist
export const deletePlaylist = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi deletePlaylist:", err);
    throw err;
  }
};
