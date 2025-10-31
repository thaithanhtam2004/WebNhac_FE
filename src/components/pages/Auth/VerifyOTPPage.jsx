import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (value.length > 1) return; // Chỉ cho phép 1 ký tự

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus ô tiếp theo
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
      setError("Vui lòng nhập đủ 6 số");
      setLoading(false);
      return;
    }

    // Gọi API xác thực OTP
    setTimeout(() => {
      setMessage("✅ Xác thực OTP thành công!");
      setLoading(false);
    }, 1500);
  };

  const handleResend = () => {
    setMessage("📧 Mã OTP mới đã được gửi!");
    setError("");
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  return (
    <>

      <h1 className="text-2xl font-semibold mb-6 text-white">NHẬP MÃ OTP</h1>

      <form className="flex flex-col space-y-6 w-full max-w-md" onSubmit={handleVerify}>
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