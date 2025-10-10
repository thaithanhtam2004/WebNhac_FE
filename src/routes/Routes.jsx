import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
// import MainLayout from "../components/layouts/MainLayout";
import AdminLayout from "../components/layouts/AdminLayout";

// Pages
import Login from "../components/pages/Auth/Login";
import ForgotPassword from "../components/pages/Auth/ForgotPassword";
import OTP from "../components/pages/Auth/OTP";
// import Search from "../components/pages/User/Search";
// import History from "../components/pages/User/History";
// import Profile from "../components/pages/User/Profile";
import Dashboard from "../components/pages/Admin/Dashboard";
import Songs from "../components/pages/Admin/ManageSong";
import Artists from "../components/pages/Admin/ManageArtist";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "otp", element: <OTP /> },
    ],
  },
  // {
  //   path: "/",
  //   element: <MainLayout />,
  //   children: [
  //     { path: "search", element: <Search /> },
  //     { path: "history", element: <History /> },
  //     { path: "profile", element: <Profile /> },
  //   ],
  // },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },   // /admin
      { path: "songs", element: <Songs /> }, 
      { path: "artists", element: <Artists /> }    // /admin/songs
      // sau này bạn thêm: artists, albums, genres, users...
    ],
  },
  ]);

export default router;
