// ✅ src/services/favoriteService.js
import axios from "axios";
const API_URL = "http://localhost:3000/api/favorites";

// Lấy danh sách bài hát yêu thích của user
export async function getUserFavorites(userId) {
  const res = await axios.get(`${API_URL}/${userId}`);
  return res.data.data;
}

// Thêm bài hát vào yêu thích
export async function addFavorite(userId, songId) {
  const res = await axios.post(API_URL, { userId, songId }); // ✅ đúng field
  return res.data;
}

// Bỏ yêu thích
export async function removeFavorite(userId, songId) {
  const res = await axios.delete(API_URL, {
    data: { userId, songId }, // ✅ đúng field
  });
  return res.data;
}
