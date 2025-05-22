import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./components/AuthContext";

import "./css/App.css";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Registro from "./pages/Registro";
import RevisionIA from "./pages/RevisionIA";
import Dashboard from "./pages/Dashboard";
import SprintBacklog from "./pages/SprintBacklog.jsx";
import Perfil from "./pages/Perfil.jsx";
import AvatarIA from "./components/AvatarIA";
import Biometricos from "./pages/biometricos";
import ResumenSemanal from "./pages/ResumenSemanal";
import LoginWhoop from './pages/LoginWhoop';
import CallbackWhoop from './pages/CallbackWhoop';

function App() {
  const { isLogin } = useContext(AuthContext);

  return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={isLogin ? <Navigate to="/home" /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
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
          <Route path="/perfil" element={<Perfil />} />
          <Route
            path="/biometricos"
            element={isLogin ? <Biometricos /> : <Navigate to="/login" />}
          />
          <Route
            path="/resumen-semanal"
            element={isLogin ? <ResumenSemanal /> : <Navigate to="/login" />}
          />
          <Route path="/whoop-login" element={<LoginWhoop />} />
          <Route path="/whoop-callback" element={<CallbackWhoop />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <LocationBasedAvatar />
    </BrowserRouter>
  );
}

// New component to conditionally render AvatarIA on route change
function LocationBasedAvatar() {
  const { pathname } = useLocation();
  if (pathname === "/login" || pathname === "/registro") return null;
  return <AvatarIA />;
}

export default App;
