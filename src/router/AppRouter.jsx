import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyOTPPage from "../pages/auth/VerifyOTPPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// Home pages
import HomePage from "../pages/home/HomePage";
import AlbumPage from "../pages/home/AlbumPage";
import AlbumListPage from "../pages/home/AlbumListPage";
import LatestPage from "../pages/home/LatestPage";
import LyricsPage from "../pages/home/LyricsPage";
import PlaylistPage from "../pages/home/PlaylistPage";
import PlaylistListPage from "../pages/home/PlaylistListPage";
import SearchResultPage from "../pages/home/SearchResultPage";
import FavoritesPage from "../pages/home/FavoritesPage";
import HistoryPage from "../pages/home/HistoryPage";

// User pages
import ProfilePage from "../pages/user/ProfilePage";

// Admin pages
import Dashboard from "../pages/admin/Dashboard";
import ManageSong from "../pages/admin/ManageSong";
import ManageArtist from "../pages/admin/ManageArtist";
import ManageGenre from "../pages/admin/ManageGenre";
import ManageAlbum from "../pages/admin/ManageAlbum";
import ManageUser from "../pages/admin/ManageUser";
import ManageSongFeature from "../pages/admin/ManageSongFeature";
import ClassifySongEmotion from "../pages/admin/ClassifySongEmotion";

const router = createBrowserRouter([
  // Auth routes
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login",           element: <LoginPage /> },
      { path: "register",        element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-otp",      element: <VerifyOTPPage /> },
      { path: "reset-password",  element: <ResetPasswordPage /> },
    ],
  },

  // Main user routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true,                   element: <HomePage /> },
      { path: "playlistlist",          element: <PlaylistListPage /> },
      { path: "playlists/:playlistId", element: <PlaylistPage /> },
      { path: "favorites",             element: <FavoritesPage /> },
      { path: "history",               element: <HistoryPage /> },
      { path: "albums",                element: <AlbumListPage /> },
      { path: "albums/:albumId",       element: <AlbumPage /> },
      { path: "lyrics/:songId",        element: <LyricsPage /> },
      { path: "profile",               element: <ProfilePage /> },
      { path: "result",                element: <SearchResultPage /> },
      { path: "latest",                element: <LatestPage /> },
    ],
  },

  // Admin routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true,        element: <Dashboard /> },
      { path: "songs",      element: <ManageSong /> },
      { path: "artists",    element: <ManageArtist /> },
      { path: "genres",     element: <ManageGenre /> },
      { path: "albums",     element: <ManageAlbum /> },
      { path: "listeners",  element: <ManageUser /> },
      { path: "features",   element: <ManageSongFeature /> },
      { path: "classify",   element: <ClassifySongEmotion /> },
    ],
  },
]);

export default router;