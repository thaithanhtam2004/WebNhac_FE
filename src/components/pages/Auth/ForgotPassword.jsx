import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 🔄 Đổi import này
import { sendOTP } from "../../../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 🔄 Gọi đúng hàm mới
      const res = await sendOTP(email);

      if (res.success) {
        setMessage(res.message || "OTP đã được gửi đến email của bạn!");
        // Chuyển hướng đến trang xác minh OTP sau 2 giây
        setTimeout(() => {
          navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(res.message || "Không thể gửi OTP. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi kết nối server hoặc email không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-xl font-semibold mb-4 text-white">QUÊN MẬT KHẨU</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-5 w-full max-w-md"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label className="text-gray-300 text-sm font-medium text-left">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-white hover:bg-gray-200 text-black shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? "Đang gửi OTP..." : "Gửi OTP"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-6">
        <p>
          <Link
            to="/auth/login"
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition"
          >
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
