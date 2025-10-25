import axios from "axios";

// 🔹 Lấy chi tiết album theo albumId
export async function getAlbumById(albumId) {
  try {
    const res = await axios.get(`http://localhost:3000/api/albums/${albumId}`);
    return res.data.data; // backend trả { success: true, data: {...} }
  } catch (err) {
    console.error("Lỗi khi lấy album:", err);
    throw err;
  }
}

// 🔹 Lấy tất cả album
export async function getAllAlbums() {
  try {
    const res = await axios.get(`http://localhost:3000/api/albums`);
    return res.data.data; // ✅ chỉ trả ra mảng album
  } catch (err) {
    console.error("Lỗi khi lấy danh sách album:", err);
    throw err;
  }
}
