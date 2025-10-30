// src/services/historyService.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/history";

// Lấy lịch sử nghe của user
export const getHistoryByUser = async (userId) => {
  const res = await axios.get(`${BASE_URL}/user/${userId}`);
  return res.data.data; // { success: true, data: [...] }
};

// Thêm 1 bài hát vào lịch sử
export const addHistorySong = async ({ userId, songId }) => {
  const res = await axios.post(BASE_URL, { userId, songId });
  return res.data.data; // trả về bài hát vừa lưu
};

// Xóa 1 bài
export const deleteHistorySong = async (songId) => {
  await axios.delete(`${BASE_URL}/${songId}`);
};

// Xóa tất cả
export const clearAllHistory = async (userId) => {
  await axios.delete(`${BASE_URL}/user/${userId}`);
};
