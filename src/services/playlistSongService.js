// 📁 src/services/playlistSongService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/playlists";

// 🟢 Lấy danh sách bài hát của playlist
export const getSongsOfPlaylist = async (playlistId) => {
  try {
    const res = await axios.get(`${API_URL}/${playlistId}`);
    // res.data.data chứa playlist kèm mảng bài hát
    return res.data.data.songs || [];
  } catch (err) {
    console.error("❌ Lỗi getSongsOfPlaylist:", err);
    return [];
  }
};

// 🟢 Thêm bài hát vào playlist
export const addSongToPlaylist = async ({ playlistId, songId }) => {
  try {
    const res = await axios.post(`${API_URL}/add-song`, { playlistId, songId });
    return res.data; // { success, message }
  } catch (err) {
    console.error("❌ Lỗi addSongToPlaylist:", err);
    throw err;
  }
};

// 🟢 Xóa bài hát khỏi playlist
export const removeSongFromPlaylist = async ({ playlistId, songId }) => {
  try {
    const res = await axios.post(`${API_URL}/remove-song`, { playlistId, songId });
    return res.data; // { success, message }
  } catch (err) {
    console.error("❌ Lỗi removeSongFromPlaylist:", err);
    throw err;
  }
};
