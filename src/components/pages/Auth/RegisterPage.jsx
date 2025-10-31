import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/authService";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    name: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (index < inputsRef.current.length - 1)
        inputsRef.current[index + 1].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) inputsRef.current[index - 1].focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (index < inputsRef.current.length - 1) {
        inputsRef.current[index + 1].focus();
      } else {
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // ✅ Kiểm tra mật khẩu xác nhận
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    const res = await registerUser({
      phone: form.phone,
      email: form.email,
      name: form.name,
      password: form.password,
    });

    setLoading(false);

    if (res.success) {
      setMessage("✅ Đăng ký thành công!");
      setTimeout(() => navigate("/auth/login"), 1500);
    } else {
      setError(res.message || "Đăng ký thất bại");
    }
  };

  const fields = [
    { name: "phone", placeholder: "Số điện thoại", type: "text", label: "Số điện thoại" },
    { name: "email", placeholder: "Email", type: "email", label: "Email" },
    { name: "name", placeholder: "Họ và Tên", type: "text", label: "Họ và Tên" },
  ];

  return (
    <>

      <h1 className="text-xl font-semibold mb-4 text-white">ĐĂNG KÝ</h1>

      <form className="flex flex-col space-y-5 w-full" onSubmit={handleSubmit}>
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

        {fields.map((input, i) => (
          <div key={input.name} className="flex flex-col space-y-2">
            <label className="text-gray-300 text-sm font-medium text-left">
              {input.label}
            </label>
            <input
              type={input.type}
              name={input.name}
              placeholder={input.placeholder}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(el) => (inputsRef.current[i] = el)}
              className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              required
            />
          </div>
        ))}
        
        {/* Trường Mật khẩu */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-sm font-medium text-left">Mật khẩu</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, fields.length)}
            ref={(el) => (inputsRef.current[fields.length] = el)}
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

        {/* ✅ Trường Xác nhận mật khẩu */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-gray-300 text-sm font-medium text-left">Xác nhận mật khẩu</label>
          <input
            type={showConfirm ? "text" : "password"}
            name="confirm"
            placeholder="Xác nhận mật khẩu"
            value={form.confirm}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, fields.length + 1)}
            ref={(el) => (inputsRef.current[fields.length + 1] = el)}
            className="p-3 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
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
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-6">
        <p>
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
};

export default RegisterPage;