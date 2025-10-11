import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="login">
      <h1 className="login-title">3TMUSIC</h1>
      <h2 className="login-subtitle">ĐĂNG NHẬP</h2>

      <form className="login-form">
        <div className="form-group">
          <label>Email / Số điện thoại</label>
          <input type="text" placeholder="Nhập email hoặc số điện thoại" />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" placeholder="Nhập mật khẩu" />
        </div>

        <button type="submit" className="btn-submit">
          Đăng nhập
        </button>
      </form>

      <div className="login-footer">
        <Link to="/register">Đăng ký tài khoản</Link>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>
    </div>
  );
}
