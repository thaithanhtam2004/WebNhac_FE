// src/lib/routers/AppRouter.jsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "../../routes/Routes";

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
