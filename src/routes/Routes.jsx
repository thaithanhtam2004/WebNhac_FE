import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import MainLayout from "../components/layouts/MainLayout";
import AdminLayout from "../components/layouts/AdminLayout";

// Pages
import HomePage from "../components/pages/HomePage/home";
import RegisterPage from "../components/pages/Auth/RegisterPage";
import Login from "../components/pages/Auth/Login";
import ForgotPassword from "../components/pages/Auth/ForgotPassword";
import FavoritesPage from "../components/pages/HomePage/FavoritesPage";

import HistoryPage from "../components/pages/HomePage/HistoryPage";
import AlbumPage from "../components/pages/HomePage/AlbumPage";
import AlbumListPage from "../components/pages/HomePage/AlbumListPage";
import PlaylistListPage from "../components/pages/HomePage/PlaylistListPage"; // danh sách playlist
import PlaylistPage from "../components/pages/HomePage/Playlist"; // chi tiết playlist

import VerifyOTPPage from "../components/pages/Auth/VerifyOTPPage";
import ResetPasswordPage from "../components/pages/Auth/ResetPasswordPage";

import SearchResultsPage from "../components/pages/HomePage/SearchResult";
import LatestSongsPage from "../components/pages/HomePage/LastestPage";

import Dashboard from "../components/pages/Admin/Dashboard";
import Songs from "../components/pages/Admin/ManageSong";
import Artists from "../components/pages/Admin/ManageArtist";
import Genres from "../components/pages/Admin/ManageGenre";
import Albums from "../components/pages/Admin/ManageAlbum";
import Listeners from "../components/pages/Admin/ManageUser";
import Features from "../components/pages/Admin/MangeSongFeature";
import Profile from "../components/pages/User/Profile";

const router = createBrowserRouter([
  // 🔹 Auth routes
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

  // 🔹 Main user routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "playlistlist", element: <PlaylistListPage /> }, // danh sách playlist
      { path: "playlists/:playlistId", element: <PlaylistPage /> }, // chi tiết playlist
      { path: "favorites", element: <FavoritesPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "albums", element: <AlbumListPage /> },
      { path: "albums/:albumId", element: <AlbumPage /> },
      { path: "profile", element: <Profile /> },
      { path: "result", element: <SearchResultsPage /> },
      { path: "latest", element: <LatestSongsPage /> },
    ],
  },

  // 🔹 Admin routes
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
      { path: "features", element: <Features /> },
    ],
  },
]);

export default router;
