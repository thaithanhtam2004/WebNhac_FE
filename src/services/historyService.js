import axios from "axios";

const BASE_URL = "http://localhost:3000/api/history";

// ✅ Lấy lịch sử nghe của user
export const getHistoryByUser = async (userId) => {
  try {
    const res = await axios.get(`${BASE_URL}/${userId}`);
    return res.data.data;
  } catch (err) {
    console.error("❌ Lỗi lấy lịch sử:", err.response?.data || err.message);
    throw err;
  }
};

// ✅ Thêm lịch sử nghe
export const addHistorySong = async ({ userId, songId }) => {
  try {
    const res = await axios.post(BASE_URL, { userId, songId });
    return res.data.data;
  } catch (err) {
    console.error("❌ Lỗi thêm lịch sử:", err.response?.data || err.message);
  }
};

// ✅ Xoá 1 bài khỏi lịch sử
export const deleteHistorySong = async ({ userId, songId }) => {
  try {
    await axios.delete(`${BASE_URL}/song`, { data: { userId, songId } });
  } catch (err) {
    console.error("❌ Lỗi xoá bài khỏi lịch sử:", err.response?.data || err.message);
  }
};

// ✅ Xoá toàn bộ lịch sử
export const clearAllHistory = async (userId) => {
  try {
    await axios.delete(`${BASE_URL}/${userId}`);
  } catch (err) {
    console.error("❌ Lỗi xoá toàn bộ lịch sử:", err.response?.data || err.message);
  }
};
