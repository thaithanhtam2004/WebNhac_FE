import { Home, Search, Music, Clock, Heart, User } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Trang chủ" },
  { icon: Music, label: "Playlist cá nhân" },
  { icon: Clock, label: "Lịch sử nghe" },
  { icon: Heart, label: "Yêu thích" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-blue-900/60 backdrop-blur-md p-8 flex flex-col justify-between text-white">
      <div>
        <h1 className="text-3xl font-extrabold mb-10 tracking-wide">3TMUSIC</h1>
        <nav className="space-y-5 text-base font-medium">
          {menuItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center space-x-3 w-full text-left hover:text-blue-300 transition-colors duration-200"
            >
              <Icon className="w-6 h-6 text-white" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-10 border-t border-blue-800/40 pt-6">
        <button className="flex items-center space-x-3 w-full text-left hover:text-blue-300 text-base font-medium transition-colors duration-200">
          <User className="w-6 h-6 text-white" />
          <span>Hồ sơ</span>
        </button>
      </div>
    </aside>
  );
}
