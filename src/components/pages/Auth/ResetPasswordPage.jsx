import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../../services/authService";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); 
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lấy Email và OTP từ query parameters của URL
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Kiểm tra tham số cần thiết trong URL
    if (!email || !otp) {
      setError("Thiếu thông tin đặt lại mật khẩu. Vui lòng bắt đầu lại quy trình Quên mật khẩu.");
      setLoading(false);
      return;
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      setLoading(false);
      return; 
    }

    try {
      const res = await resetPassword(email, otp, newPassword); 
      setMessage(res.message || "✅ Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang Đăng nhập...");
      setTimeout(() => navigate("/auth/login"), 2000); 
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <h1 className="text-xl font-semibold mb-4 text-white">NHẬP MẬT KHẨU MỚI</h1>

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

        {/* Trường Mật khẩu mới */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-sm font-medium text-left">
            Mật khẩu mới
          </label>
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition"
            tabIndex={-1}
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {/* Trường Xác nhận mật khẩu mới */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-sm font-medium text-left">
            Xác nhận mật khẩu mới
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu mới của bạn"
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
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
          {loading ? "Đang đặt lại mật khẩu..." : "Xác nhận đặt lại mật khẩu"}
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

export default ResetPasswordPage;