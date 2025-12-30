import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../components/providers/AuthContext";

const AdminGuard = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // hoặc spinner

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.roleName !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
