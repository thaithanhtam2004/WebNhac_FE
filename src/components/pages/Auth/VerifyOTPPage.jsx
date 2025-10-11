import React, { useState } from "react";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    console.log("OTP nhập:", otpCode);
    // Gọi API xác thực OTP ở đây
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nhập Mã OTP</h2>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center space-x-2">
            {otp.map((num, i) => (
              <input
                key={i}
                maxLength={1}
                value={num}
                onChange={(e) => handleChange(e.target.value, i)}
                className="w-10 h-10 text-center border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-md transition"
          >
            Verify OTP
          </button>

          <p className="text-sm text-gray-600">
            Nếu bạn chưa nhận được mã?{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">
              Gửi lại
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
