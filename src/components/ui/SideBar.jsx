import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <h1>3TMUSIC</h1>
      </div>

      {/* Menu chính */}
      <div className="sidebar-menu">
        <Link to="/home">Trang chủ</Link>
        <Link to="/search">Tìm kiếm</Link>
      </div>

      {/* Menu phụ */}
      <div className="sidebar-submenu">
        <Link to="/playlist">Playlist cá nhân</Link>
        <Link to="/history">Lịch sử nghe</Link>
        <Link to="/favorites">Bài hát yêu thích</Link>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <Link to="/profile">Hồ sơ cá nhân</Link>
      </div>
    </div>
  );
}
