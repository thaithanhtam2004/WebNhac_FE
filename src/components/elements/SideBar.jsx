import { Home, Music, Clock, Heart, User } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ import hook điều hướng

const menuItems = [
  { icon: Home, label: "Trang chủ", path: "/" },
  { icon: Music, label: "Playlist cá nhân", path: "/playlist" }, // ✅ trang playlist
  { icon: Clock, label: "Lịch sử nghe", path: "/history" },
  { icon: Heart, label: "Yêu thích", path: "/favorites" },
];

export default function Sidebar() {
  const navigate = useNavigate(); // ✅ khởi tạo điều hướng

  return (
    <aside className="w-64 h-screen p-8 flex flex-col justify-between text-white bg-black/70 backdrop-blur-lg shadow-2xl border-r border-gray-800">
      {/* Logo + Menu chính */}
      <div>
        <motion.h1
          className="text-3xl font-extrabold mb-10 tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 bg-clip-text text-transparent relative overflow-hidden"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          3TMUSIC
        </motion.h1>

        {/* Menu items */}
        <nav className="space-y-5 text-base font-medium">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <motion.button
              key={label}
              onClick={() => navigate(path)} // ✅ chuyển trang khi bấm
              className="group flex items-center space-x-3 w-full text-left text-gray-300 hover:text-cyan-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="p-2 rounded-lg bg-gray-800/40 group-hover:bg-cyan-500/20 transition-all duration-300"
                whileHover={{ rotate: 10 }}
              >
                <Icon className="w-6 h-6 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300" />
              </motion.div>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                {label}
              </span>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Hồ sơ người dùng */}
      <div className="mt-10 border-t border-gray-700 pt-6">
        <motion.button
          className="flex items-center space-x-3 w-full text-left text-gray-300 hover:text-cyan-400 text-base font-medium transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/profile")} // ✅ thêm điều hướng hồ sơ
        >
          <User className="w-6 h-6 text-gray-300 group-hover:text-cyan-400 transition-colors duration-300" />
          <span>Hồ sơ</span>
        </motion.button>
      </div>
    </aside>
  );
}
