import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ thêm state hiển thị thành công
  const [loading, setLoading] = useState(false);

  // refs cho phím ↑ ↓
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const buttonRef = useRef(null);

  const handleKeyDown = (e, nextRef, prevRef) => {
    if (e.key === "ArrowDown" && nextRef?.current) {
      nextRef.current.focus();
    } else if (e.key === "ArrowUp" && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  // 🟢 Xử lý đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setSuccess(" Đăng nhập thành công!");
        setTimeout(() => navigate("/"), 1500); // chuyển trang sau 1.5s
      } else {
        setError(res.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a0a0a] text-white px-4">
      <h1 className="text-3xl font-bold mb-6">3TMUSIC</h1>

      <div className="bg-[#111] shadow-xl rounded-xl w-full max-w-sm p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">ĐĂNG NHẬP</h2>

        <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
          {/* ✅ Hiển thị lỗi hoặc thành công */}
          {error && <p className="text-center text-red-400 text-sm">{error}</p>}
          {success && (
            <p className="text-center text-green-400 text-sm">{success}</p>
          )}

          <div className="flex flex-col space-y-2">
            <label>Email / Số điện thoại</label>
            <input
              ref={emailRef}
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, passwordRef, null)}
              className="p-3 bg-transparent border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div className="flex flex-col space-y-2 relative">
            <label>Mật khẩu</label>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, buttonRef, emailRef)}
              className="p-3 bg-transparent border border-gray-600 rounded-md text-white pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-white"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            ref={buttonRef}
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-md transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-white hover:bg-gray-200 text-black"
            }`}
            onKeyDown={(e) => handleKeyDown(e, null, passwordRef)}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-6 space-y-2">
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/auth/register" className="text-blue-400 hover:underline">
              Đăng KÝ
            </Link>
          </p>
          <p>
            <Link
              to="/auth/forgot-password"
              className="text-gray-400 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
