import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./css/App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Registro from "./pages/Registro"; // 👈 Importación correcta

function App() {
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("isLogin") === "true" || false;
  });

  const tryLogin = async (user) => {
    try {
      const result = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!result.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await result.json();
      console.log(data);

      if (data.isLogin) {
        setIsLogin(true);
        localStorage.setItem("isLogin", "true");
        return true;
      } else {
        setIsLogin(false);
        localStorage.setItem("isLogin", "false");
        return false;
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      return false;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isLogin ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={
            isLogin ? <Navigate to="/home" /> : <Login tryLogin={tryLogin} />
          }
        />
        <Route
          path="/registro"
          element={<Registro />}
        />
        <Route
          path="/home"
          element={isLogin ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/generate"
          element={isLogin ? <Generate /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

