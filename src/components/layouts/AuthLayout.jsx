import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="h-screen w-screen flex justify-center items-center bg-slate-900">
      <div className="bg-black text-white px-8 py-10 w-full max-w-md text-center rounded-xl shadow-lg shadow-black/60">
        <Outlet /> {/* Render Login / ForgotPassword / OTP */}
      </div>
    </div>
  );
}
