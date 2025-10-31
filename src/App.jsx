

import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage/home";
import RegisterPage from "./components/pages/Auth/RegisterPage";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<HomePage />} />
//       <Route path="/register" element={<RegisterPage />} />
//     </Routes>
//   );
// =======
//  import HomePage from "./components/pages/HomePage/home.jsx";

//  export default function App() {
//   return (
//     <div className="min-h-screen">
//       <HomePage />
//      </div>
//  );
//  }
//  src/App.jsx
 import React from "react";
 import AppRouter from "./lib/routers/AppRouter";

 function App() {
   return <AppRouter />;

}

export default App;

