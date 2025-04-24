import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./components/AuthContext";

import "./css/App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Registro from "./pages/Registro";
import RevisionIA from "./pages/RevisionIA";
import Dashboard from "./pages/Dashboard";

function App() {
  const { isLogin } = useContext(AuthContext); // Access isLogin from AuthContext

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLogin ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/login"
          element={isLogin ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/registro"
          element={isLogin ? <Registro /> : <Navigate to="/login" />}
        />
        <Route
          path="/home"
          element={isLogin ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/generate"
          element={isLogin ? <Generate /> : <Navigate to="/login" />}
        />
        <Route
          path="/revisionIA"
          element={isLogin ? <RevisionIA /> : <Navigate to="/login" />}
        />
        <Route
          path="/project/:projectId"
          element={isLogin ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;