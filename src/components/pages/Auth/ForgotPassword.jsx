import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendForgotPassword } from "../../../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await sendForgotPassword(email);
      setMessage(res.message || "✅ Mã OTP đã được gửi về email!");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <h1 className="text-2xl font-semibold mb-6 text-white">QUÊN MẬT KHẨU</h1>

      <form className="flex flex-col space-y-5 w-full max-w-md" onSubmit={handleSubmit}>
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
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
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