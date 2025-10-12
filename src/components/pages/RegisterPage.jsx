import React from "react";

const RegisterPage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a0a0a] text-white px-4">
      {/* Logo hoặc tên thương hiệu */}
      <h1 className="text-3xl font-bold text-white mb-6 select-none">
        3TMUSIC
      </h1>

      {/* Form */}
      <div className="bg-[#111] shadow-xl rounded-xl w-full max-w-sm p-8 flex flex-col">
        <h2 className="text-2xl font-semibold text-center mb-6">ĐĂNG KÝ</h2>

        <form className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Số điện thoại"
            className="w-full p-3 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />
          <input
            type="text"
            placeholder="Họ và Tên"
            className="w-full p-3 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-3 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-white"
          />

          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-3 rounded-md transition"
          >
            Đăng ký
          </button>
        </form>

        {/* đăng nhập */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
