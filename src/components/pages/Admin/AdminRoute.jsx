import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth/login" replace />;

  if (user.roleName !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
