import React from "react";
import { FaFacebook, FaGoogle } from "react-icons/fa";

const RegisterPage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4">
      {/* Logo hoặc tên thương hiệu */}
      <h1 className="text-3xl font-bold text-orange-500 mb-6 select-none">
        3TMUSIC
      </h1>

      {/* Form */}
      <div className="bg-white shadow-lg rounded-xl w-full max-w-sm p-8 flex flex-col">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Đăng ký
        </h2>

        <form className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Số điện thoại"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <input
            type="text"
            placeholder="Họ và Tên"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-md transition"
          >
            ĐĂNG KÝ
          </button>
        </form>

        {/* đăng nhập */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
