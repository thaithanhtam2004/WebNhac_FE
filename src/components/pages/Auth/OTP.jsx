import { useRef } from "react";
import { Link } from "react-router-dom";
import "./OTP.css";

export default function OTP() {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length === 1 && index < inputsRef.current.length - 1) {
      // Move to next
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      // Move to previous
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="otp">
      <h1 className="otp-title">3TMUSIC</h1>
      <h2 className="otp-subtitle">NHẬP OTP TẠI ĐÂY</h2>

      <form className="otp-form">
        <div className="otp-inputs">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              className="otp-input"
              ref={(el) => (inputsRef.current[i] = el)}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <button type="submit" className="btn-submit">
          Xác nhận
        </button>
      </form>

      <div className="otp-footer">
        <Link to="/login">Hủy</Link>
      </div>
    </div>
  );
}
