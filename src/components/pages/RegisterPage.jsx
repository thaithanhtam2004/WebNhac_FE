import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

const RegisterPage = () => {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    name: "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate(); // 🔹 Dùng để chuyển trang

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
        handleSubmit(e); // ⏎ ở ô cuối → tự submit
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    const res = await registerUser({
      phone: form.phone,
      email: form.email,
      name: form.name,
      password: form.password,
    });

    if (res.success) {
      setMessage(" Đăng ký thành công!");
      setTimeout(() => navigate("/auth/login"), 1500);
    } else {
      setMessage(` ${res.message}`);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a0a0a] text-white px-4">
      <h1 className="text-3xl font-bold mb-6">3TMUSIC</h1>

      <div className="bg-[#111] shadow-xl rounded-xl w-full max-w-sm p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">ĐĂNG KÝ</h2>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {[
            { name: "phone", placeholder: "Số điện thoại", type: "text" },
            { name: "email", placeholder: "Email", type: "email" },
            { name: "name", placeholder: "Họ và Tên", type: "text" },
            { name: "password", placeholder: "Mật khẩu", type: "password" },
            {
              name: "confirm",
              placeholder: "Xác nhận mật khẩu",
              type: "password",
            },
          ].map((input, i) => (
            <input
              key={input.name}
              type={input.type}
              name={input.name}
              placeholder={input.placeholder}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(el) => (inputsRef.current[i] = el)}
              className="p-3 bg-transparent border border-gray-600 rounded-md text-white focus:outline-none focus:border-white"
            />
          ))}

          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-md transition"
          >
            Đăng ký
          </button>
        </form>

        {message && <p className="text-center text-sm mt-4">{message}</p>}

        <p className="text-center text-sm text-gray-400 mt-6">
          Đã có tài khoản?{" "}
          <a href="/auth/login" className="text-blue-400 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
