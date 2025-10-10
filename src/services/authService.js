import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi đăng ký",
    };
  }
};

export const loginWithGoogle = () => {
  window.location.href = `${API_URL}/google`;
};

export const loginWithFacebook = () => {
  window.location.href = `${API_URL}/facebook`;
};
