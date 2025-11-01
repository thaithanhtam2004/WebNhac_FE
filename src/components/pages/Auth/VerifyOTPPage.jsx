import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { verifyOTP } from "../../../services/authService";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // 👉 Ưu tiên lấy email từ state, nếu không có thì lấy từ URL
  const searchParams = new URLSearchParams(location.search);
  const emailFromQuery = searchParams.get("email");
  const email = location.state?.email || emailFromQuery;

  // ✅ Nếu vẫn không có email, báo lỗi ngay
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white text-center space-y-4">
        <h2 className="text-2xl font-bold">❌ Thiếu thông tin email!</h2>
        <p className="text-gray-400">
          Vui lòng quay lại trang{" "}
          <Link
            to="/auth/forgot-password"
            className="text-blue-400 underline hover:text-blue-300"
          >
            Quên mật khẩu
          </Link>{" "}
          và nhập lại email để lấy mã OTP mới.
        </p>
      </div>
    );
  }

  const handleChange = (value, index) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus ô kế tiếp
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      setLoading(false);
      return;
    }

    try {
      const res = await verifyOTP(email, otpCode);
      setMessage(res.message || "✅ Xác thực OTP thành công!");
      setTimeout(() => {
        navigate(`/auth/reset-password?email=${email}&otp=${otpCode}`);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "❌ OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setMessage("📧 Mã OTP mới đã được gửi tới email của bạn!");
    inputsRef.current[0]?.focus();
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6 text-white text-center">
        NHẬP MÃ OTP
      </h1>

      <form
        className="flex flex-col space-y-6 w-full max-w-md mx-auto"
        onSubmit={handleVerify}
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

        <div className="flex justify-center gap-2">
          {otp.map((num, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              maxLength={1}
              value={num}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-12 text-center text-xl font-semibold bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          ))}
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
          {loading ? "Đang xác thực..." : "Xác thực OTP"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-6 space-y-3">
        <p>
          Chưa nhận được mã?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition"
          >
            Gửi lại
          </button>
        </p>
        <p>
          <Link
            to="/auth/login"
            className="text-gray-400 hover:text-gray-300 hover:underline transition"
          >
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
};

export default VerifyOTPPage;
