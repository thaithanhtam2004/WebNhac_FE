import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "@/components/pages/RegisterPage";
import LoginPage from "@/components/pages/LoginPage"; // nếu có
import "./index.css";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}
