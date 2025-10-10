import { Link } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  return (
    <div className="forgot">
      <h1 className="forgot-title">3TMUSIC</h1>
      <h2 className="forgot-subtitle">QUÊN MẬT KHẨU</h2>

      <form className="forgot-form">
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Nhập email của bạn" />
        </div>

        <button type="submit" className="btn-submit">
          Gửi liên kết khôi phục
        </button>
      </form>

      <div className="forgot-footer">
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
}
