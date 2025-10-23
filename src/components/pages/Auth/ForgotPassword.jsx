import React, { useState } from "react";
import { sendForgotPassword } from "../../../services/authService"; // ✅ import service

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await sendForgotPassword(email);
      setMessage(res.message || "Mã OTP đã được gửi về email!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Lỗi gửi OTP");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quên mật khẩu</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-start">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              <span className="text-red-500">*</span> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-md transition"
          >
            Gửi yêu cầu
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
