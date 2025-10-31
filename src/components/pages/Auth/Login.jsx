import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../providers/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Lấy hàm login từ AuthContext
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
        const userData = res.data.data; // ✅ Lấy đúng phần data từ backend

        // ✅ Lưu token vào localStorage
        localStorage.setItem("token", userData.token);

        // ✅ Cập nhật AuthContext với thông tin user
        login(userData);

        setSuccess("✅ Đăng nhập thành công!");
        setTimeout(() => navigate("/"), 1500);
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
    <>


      <h1 className="text-2xl font-semibold mb-6 text-white">ĐĂNG NHẬP</h1>

      <form className="flex flex-col space-y-5 w-full" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-center">
            {success}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label className="text-gray-300 text-sm font-medium text-left">
            Email / Số điện thoại
          </label>
          <input
            ref={emailRef}
            type="text"
            placeholder="Nhập email hoặc số điện thoại"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, passwordRef, null)}
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
        </div>

        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-sm font-medium text-left">Mật khẩu</label>
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, buttonRef, emailRef)}
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          ref={buttonRef}
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-white hover:bg-gray-200 text-black shadow-lg hover:shadow-xl"
          }`}
          onKeyDown={(e) => handleKeyDown(e, null, passwordRef)}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-6 space-y-3">
        <p>
          Chưa có tài khoản?{" "}
          <Link
            to="/auth/register"
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition"
          >
            Đăng ký ngay
          </Link>
        </p>
        <p>
          <Link
            to="/auth/forgot-password"
            className="text-gray-400 hover:text-gray-300 hover:underline transition"
          >
            Quên mật khẩu?
          </Link>
        </p>
      </div>
    </>
  );
}

export default LoginPage;