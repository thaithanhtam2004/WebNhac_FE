import React, { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  // Focus refs (giống trang Login)
  const pass1Ref = useRef(null);
  const pass2Ref = useRef(null);
  const buttonRef = useRef(null);

  const handleKeyDown = (e, next, prev) => {
    if (e.key === "ArrowDown" && next?.current) next.current.focus();
    else if (e.key === "ArrowUp" && prev?.current) prev.current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email || !otp) {
      setError("Thiếu thông tin xác thực. Vui lòng thực hiện lại quy trình quên mật khẩu.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận không khớp!");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword(email, otp, newPassword);
      setMessage(res.message || "Đặt lại mật khẩu thành công! Đang chuyển hướng...");

      setTimeout(() => navigate("/auth/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-white">ĐẶT LẠI MẬT KHẨU MỚI</h1>

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

        {/* Mật khẩu mới */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-left font-medium">Mật khẩu mới</label>
          <input
            ref={pass1Ref}
            type={showNewPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, pass2Ref, null)}
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition"
            onClick={() => setShowNewPassword(!showNewPassword)}
            tabIndex={-1}
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-left font-medium">Xác nhận mật khẩu</label>
          <input
            ref={pass2Ref}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, buttonRef, pass1Ref)}
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          ref={buttonRef}
          type="submit"
          disabled={loading}
          onKeyDown={(e) => handleKeyDown(e, null, pass2Ref)}
          className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-white hover:bg-gray-200 text-black shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? "Đang cập nhật..." : "Xác nhận đặt lại mật khẩu"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-6">
        <Link
          to="/auth/login"
          className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition"
        >
          ← Quay lại đăng nhập
        </Link>
      </div>
    </>
  );
};

export default ResetPasswordPage;
