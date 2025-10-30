import axios from "axios";

const API_URL = "http://localhost:3000/api/emotions";

// 🔹 Lấy tất cả cảm xúc
export async function getAllEmotions() {
  try {
    const res = await axios.get(API_URL);
    return res.data.data; // ✅ trả mảng emotion
  } catch (err) {
    console.error("Lỗi khi lấy danh sách cảm xúc:", err);
    throw err;
  }
}

// 🔹 Lấy chi tiết cảm xúc theo ID
export async function getEmotionById(emotionId) {
  try {
    const res = await axios.get(`${API_URL}/${emotionId}`);
    return res.data.data;
  } catch (err) {
    console.error("Lỗi khi lấy cảm xúc:", err);
    throw err;
  }
}

// 🔹 Tạo cảm xúc mới
export async function createEmotion(data) {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi tạo cảm xúc:", err);
    throw err;
  }
}

// 🔹 Cập nhật cảm xúc
export async function updateEmotion(emotionId, data) {
  try {
    const res = await axios.put(`${API_URL}/${emotionId}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi cập nhật cảm xúc:", err);
    throw err;
  }
}

// 🔹 Xóa cảm xúc
export async function deleteEmotion(emotionId) {
  try {
    const res = await axios.delete(`${API_URL}/${emotionId}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi xóa cảm xúc:", err);
    throw err;
  }
}
