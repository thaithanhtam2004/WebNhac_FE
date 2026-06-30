import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🟢 Lấy user từ localStorage (có kiểm tra an toàn)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } else {
        localStorage.removeItem("user"); // Dọn rác nếu có chuỗi "undefined"
      }
    } catch (error) {
      console.error("Lỗi khi đọc user từ localStorage:", error);
      localStorage.removeItem("user");
    }
  }, []);

  // ✅ Hàm đăng nhập
  // ✅ Hàm đăng nhập
  const login = (userData) => {
    // Nếu backend trả về có trường "data" thì dùng nó
    const data = userData.data || userData;

    // Gán lại các field chuẩn hóa
    const formattedUser = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      roleName: data.roleName,
      token: data.token, // Lưu token nếu cần gọi API bảo mật
    };

    setUser(formattedUser);
    localStorage.setItem("user", JSON.stringify(formattedUser));
    localStorage.setItem("token", data.token);
  };

  // ✅ Hàm đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // dọn luôn token nếu có
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook tiện dùng
export const useAuth = () => useContext(AuthContext);
