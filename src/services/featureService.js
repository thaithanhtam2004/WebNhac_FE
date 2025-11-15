import axios from "axios";

const BASE_URL = "http://localhost:3000/api/features";

// 🔹 Phân tích bài hát (upload file audio)
export async function analyzeSongFeature(songId, emotionId, file) {
  try {
    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("emotionId", emotionId);
    formData.append("file", file);

    const res = await axios.post(`${BASE_URL}/analyze`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ backend trả về: { success, message, data } hoặc object feature
    return res.data; 
  } catch (err) {
    console.error("❌ Lỗi phân tích bài hát:", err);
    throw err.response?.data || { message: "Phân tích thất bại" };
  }
}

// 🔹 Lấy feature theo songId
export async function getFeatureBySongId(songId) {
  try {
    const res = await axios.get(`${BASE_URL}/${songId}`);
    return res.data; // backend trả trực tiếp object feature
  } catch (err) {
    console.error("❌ Lỗi lấy feature:", err);
    throw err.response?.data || { message: "Không thể lấy feature" };
  }
}

export async function predictSongEmotion(songId, file) {
  try {
    const formData = new FormData();
    formData.append("songId", songId); // 🟢 thêm dòng này
    formData.append("file", file);

    const res = await axios.post(`${BASE_URL}/predict-emotion`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // { success, emotion, features, ... }
  } catch (err) {
    console.error("❌ Lỗi dự đoán cảm xúc:", err);
    throw err.response?.data || { message: "Dự đoán cảm xúc thất bại" };
  }
}
