
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage/home";
import RegisterPage from "./components/pages/RegisterPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;

