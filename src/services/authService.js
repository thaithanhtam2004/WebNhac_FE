import axios from "axios";

const API_URL = "http://localhost:3000/api/users";

// 🟢 Đăng ký tài khoản
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data; // { success, message }
  } catch (err) {
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return { success: false, message: "Lỗi kết nối server" };
  }
};

// 🟢 Đăng nhập
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    return res.data; // { success, token, message? }
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
    console.error("❌ Lỗi khi lấy thông tin user:", error);
    return { success: false, message: "Không thể kết nối tới máy chủ" };
  }
};

// 🟢 Gửi OTP tới email (bước 1 của quên mật khẩu)
export const sendOTP = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/send-otp`, { email });
    return res.data; // { success, message }
  } catch (err) {
    throw err.response?.data || { success: false, message: "Lỗi gửi OTP" };
  }
};

// 🟢 Xác thực OTP (bước 2)
export const verifyOTP = async (email, otp) => {
  try {
    const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return res.data; // { success, message }
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: "OTP không hợp lệ hoặc đã hết hạn",
      }
    );
  }
};

// 🟢 Đặt lại mật khẩu (bước 3)
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const res = await axios.post(`${API_URL}/reset-password`, {
      email,
      otp,
      newPassword,
    });
    return res.data; // { success, message }
  } catch (err) {
    throw (
      err.response?.data || { success: false, message: "Lỗi đặt lại mật khẩu" }
    );
  }
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