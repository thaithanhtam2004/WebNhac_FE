import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router/AppRouter";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { MusicPlayerProvider } from "./contexts/PlayerContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <MusicPlayerProvider>
        <RouterProvider router={router} />
      </MusicPlayerProvider>
    </AuthProvider>
  </React.StrictMode>
);
