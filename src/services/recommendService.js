import axios from "axios";

const API_BASE = "http://localhost:3000/api/recommendations";

// Lấy recommendation + thông tin bài hát
export const getRecommendSongWithDetail = async (userId, limit = 20) => {
  const response = await axios.get(`${API_BASE}/${userId}/details?limit=${limit}`);
  return response.data.data; // FE nhận trực tiếp mảng recommendation với title, singer, genre
};
