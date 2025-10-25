import axios from "axios";
const API_URL = "http://localhost:3000/api/users";

// 🟢 Gửi request đăng ký
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data; // trả về { success, message }
  } catch (err) {
    // Nếu có lỗi từ server
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return { success: false, message: "Lỗi kết nối server" };
  }
};

export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    return res.data; // trả về { success, token, message? }
  } catch (error) {
    throw error.response?.data?.message || "Lỗi kết nối server";
  }
};

// 🟢 Lấy danh sách tất cả user (cần token)
export const getAllUsers = async (token) => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách user:", error);
    return { success: false, message: "Không thể kết nối tới máy chủ" };
  }
};

// 🟢 Lấy user theo ID
export const getUserById = async (id, token) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return { success: false, message: "Không thể kết nối tới máy chủ" };
  }
};

// 🟢 Gửi yêu cầu quên mật khẩu (gửi OTP đến email)
export const sendForgotPassword = async (email) => {
  const res = await axios.post(`${API_URL}/forgot-password`, { email });
  return res.data;
};

// 🟢 Xác thực OTP và đặt lại mật khẩu mới
export const resetPassword = async (email, otp, newPassword) => {
  const res = await axios.post(`${API_URL}/reset-password`, {
    email,
    otp,
    newPassword,
  });
  return res.data;
};
// 🟢 Vô hiệu hóa user
export const disableUser = async (id, token) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await res.json();
  } catch (error) {
    console.error("❌ Lỗi khi vô hiệu hóa user:", error);
    return { success: false, message: "Không thể kết nối tới máy chủ" };
  }
};
