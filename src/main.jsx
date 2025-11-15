import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes/Routes.jsx";
import "./index.css";
import { AuthProvider } from "./components/providers/AuthContext";
import { MusicPlayerProvider } from "./components/providers/PlayerContext";


ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
  <AuthProvider>
    <MusicPlayerProvider>
      <RouterProvider router={router} />
    </MusicPlayerProvider>
  </AuthProvider>
</React.StrictMode>

);
