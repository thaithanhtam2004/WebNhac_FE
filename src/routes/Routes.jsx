import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import MainLayout from "../components/layouts/MainLayout";
import AdminLayout from "../components/layouts/AdminLayout";

// Pages
import HomePage from "../components/pages/HomePage/home";
import RegisterPage from "../components/pages/RegisterPage";
import Login from "../components/pages/Auth/Login";
import ForgotPassword from "../components/pages/Auth/ForgotPassword";
import FavoritesPage from "../components/pages/HomePage/FavoritesPage";
import PlaylistPage from "../components/pages/HomePage/PlaylistPage";
import HistoryPage from "../components/pages/HomePage/HistoryPage";
import AlbumPage from "../components/pages/HomePage/AlbumPage";
import VerifyOTPPage from "../components/pages/Auth/VerifyOTPPage";
import ResetPasswordPage from "../components/pages/Auth/ResetPasswordPage";
// import Search from "../components/pages/User/Search";
// import History from "../components/pages/User/History";
// import Profile from "../components/pages/User/Profile";
import Dashboard from "../components/pages/Admin/Dashboard";
import Songs from "../components/pages/Admin/ManageSong";
import Artists from "../components/pages/Admin/ManageArtist";
import Genres from "../components/pages/Admin/ManageGenre";
import Albums from "../components/pages/Admin/ManageAlbum";
import Listeners from "../components/pages/Admin/ManageUser";

import Profile from "../components/pages/User/Profile";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "verify-otp", element: <VerifyOTPPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "playlist", element: <PlaylistPage /> },
      { path: "favorites", element: <FavoritesPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "album", element: <AlbumPage /> },
      { path: "profile", element: <Profile /> },
    ],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [

      { index: true, element: <Dashboard /> },   
      { path: "songs", element: <Songs /> }, 
      { path: "artists", element: <Artists /> },
      { path: "genres", element: <Genres /> },
      { path: "albums", element: <Albums /> },
      { path: "listeners", element: <Listeners /> },


    ],
  },
]);

export default router;
