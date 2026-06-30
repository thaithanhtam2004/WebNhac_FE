import React from "react";
import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = () =>
    alert("Chức năng đổi mật khẩu sẽ được thêm sau!");

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Hồ sơ cá nhân</h1>
        </div>

        {/* Avatar & Name */}
        <div className="bg-[#181818] rounded-lg p-6 mb-4">
          {/* Personal Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#282828] rounded-lg">
              <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-1">Tên người dùng</p>
                <p className="text-white font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#282828] rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-1">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-[#181818] rounded-lg p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Bảo mật</h3>
          </div>
          <button
            onClick={handleChangePassword}
            className="w-full px-4 py-3 bg-[#282828] text-white rounded-lg hover:bg-[#383838] transition-colors text-sm font-medium"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;