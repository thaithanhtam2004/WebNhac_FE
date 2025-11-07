import axios from "axios";

const API_URL = "http://localhost:3000/api/albums";

// 🔹 Lấy danh sách bài hát của album
export const getSongsOfAlbum = async (albumId) => {
  try {
    const res = await axios.get(`${API_URL}/${albumId}/songs`);
    // backend trả về { success: true, data: [songs...] }
    return res.data.data || [];
  } catch (err) {
    console.error("❌ Lỗi getSongsOfAlbum:", err);
    return [];
  }
};

// 🔹 Thêm một bài hát vào album
export const addSongToAlbum = async ({ albumId, songId }) => {
  try {
    const res = await axios.post(`${API_URL}/${albumId}/songs/${songId}`);
    return res.data; // { success, message }
  } catch (err) {
    console.error("❌ Lỗi addSongToAlbum:", err);
    throw err;
  }
};

// 🔹 Thêm nhiều bài hát vào album
export const addMultipleSongsToAlbum = async ({ albumId, songIds }) => {
  try {
    const res = await axios.post(`${API_URL}/${albumId}/songs`, { songIds });
    return res.data; // { success, message }
  } catch (err) {
    console.error("❌ Lỗi addMultipleSongsToAlbum:", err);
    throw err;
  }
};

// 🔹 Cập nhật danh sách bài hát trong album
export const updateAlbumSongs = async ({ albumId, songIds }) => {
  try {
    const res = await axios.put(`${API_URL}/${albumId}/songs`, { songIds });
    return res.data; // { success, message }
  } catch (err) {
    console.error("❌ Lỗi updateAlbumSongs:", err);
    throw err;
  }
};

// 🔹 Xóa bài hát khỏi album
export const removeSongFromAlbum = async ({ albumId, songId }) => {
  try {
    const res = await axios.delete(`${API_URL}/${albumId}/songs/${songId}`);
    return res.data; // { success, message }
  } catch (err) {
    console.error("❌ Lỗi removeSongFromAlbum:", err);
    throw err;
  }
};
