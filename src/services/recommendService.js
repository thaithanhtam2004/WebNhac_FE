import axios from "axios";

const API_BASE = "http://localhost:3000/api/recommend";

/**
 * Lấy danh sách bài hát gợi ý cho user kèm chi tiết bài hát
 * @param {string} userId
 * @param {number} limit
 */
export const getRecommendSongWithDetail = async (userId, limit = 20) => {
  try {
    const res = await axios.get(`${API_BASE}/${userId}/details?limit=${limit}`);
    // API Node.js nên trả về { data: [ { songId, title, fileUrl, singerName, genreName, score } ] }
    return res.data.data || [];
  } catch (err) {
    console.error("❌ Failed to fetch recommendations:", err);
    return [];
  }
};
