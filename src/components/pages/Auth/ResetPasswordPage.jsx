import React, { useState } from "react";
import { resetPassword } from "../../../services/authService";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState(""); // 👈 lấy lại email từ người dùng
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const res = await resetPassword(email, otp, newPassword);
      setMessage(res.message || "Đặt lại mật khẩu thành công!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Đặt lại mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border border-gray-300 rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md"
          >
            Xác nhận
          </button>

          {message && <p className="text-sm text-gray-700 mt-3">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
