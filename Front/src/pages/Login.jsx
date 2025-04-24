import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { UserContext } from "../components/UserContext";

import "../css/Login.css";

const Login = () => {
  const { setIsLogin } = React.useContext(AuthContext); // Usamos el contexto de autenticación
  const { setUserId, setRole } = React.useContext(UserContext); // Usamos el contexto de usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

      if (data.isLogin) {
        setIsLogin(true);
        setUserId(data.user.UserID); // Guardar el userId en el contexto
        setRole(data.user.role); // Guardar el rol en el contexto
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      return false;
    }
  };

  const onsubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Favor de llenar todos los campos.");
      return;
    }
    setIsLoading(true);
    const isLogin = await tryLogin({ email, password });

    if (isLogin) {
      setEmail("");
      setPassword("");
      alert("Login logrado!");
      setIsLoading(false);
      navigate("/dungeon");
    } else {
      alert("Login fallido: Email o contraseña incorrectos.");
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    navigate("/registro");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/softedge_logo.png" alt="Logo Softedge" className="logo" />
        <h1 className="title">Inicia Sesión</h1>
        <h2 className="subtitle">FRIDA Product Planner</h2>
        <p className="login-text">
          Si todavía no tienes una cuenta.
          <br /> <br />
          <span className="register-link" onClick={goToRegister}>
            ¡Regístrate Aquí!
          </span>
        </p>
        <img
          src="/Login.png"
          alt="Login Illustration"
          className="illustration"
        />
      </div>

      <div className="login-right">
        <form className="form" onSubmit={onsubmit}>
          <h2 className="form-title">Inicio de Sesión</h2>
          <input
            className="input"
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="main-button">
            Iniciar Sesión
          </button>
        </form>
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Iniciando sesión...</p>
        </div>
      )}
    </div>
  );
};

export default Login;
