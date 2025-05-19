import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el componente de popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el componente de popup de éxito

import "../css/Login.css";

const Login = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend
  const { setIsLogin } = useContext(AuthContext); // Usamos el contexto de autenticación
  const { setUserId, setRole } = React.useContext(UserContext); // Usamos el contexto de usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito
  const navigate = useNavigate();

  const tryLogin = async (user) => {
    try {
      const result = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await result.json();

      if (result.ok && data.success) {
        localStorage.setItem("token", data.token); // Guardar el token en el almacenamiento local
        localStorage.setItem("userId", data.user.id); // Guardar el userId en el almacenamiento local
        localStorage.setItem("role", data.user.role); // Guardar el rol en el almacenamiento local
        setIsLogin(true);
        setUserId(data.user.id); // Guardar el userId en el contexto
        setRole(data.user.role); // Guardar el rol en el contexto
        return true;
      } else {
        setError(data.message || "Error al iniciar sesión"); // Establece el mensaje de error
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Error al intentar iniciar sesión. Por favor, verifica tu conexión o intenta más tarde."
      ); // Establece el mensaje de error
      return false;
    }
  };

  const onsubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Favor de llenar todos los campos."); // Muestra el error si faltan campos
      return;
    }
    setIsLoading(true);
    const isLogin = await tryLogin({ email, password });
  
    if (isLogin) {
      navigate("/home"); // Redirige directamente a la página principal
    }
    setIsLoading(false);
  };

  const handleSuccessClose = () => {
    setSuccessMessage(null); // Cierra el popup de éxito
    navigate("/home"); // Redirige a la página principal después de cerrar el popup
  };

  const goToRegister = () => {
    navigate("/registro");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/softedge_logo.png" alt="Logo Softedge" className="logo" />
        <h1 className="title">StratEdge</h1>
        <h2 className="subtitle">Por: SoftEdge</h2>
        <p className="login-text">
          StratEdge es una plataforma inteligente para planear y gestionar proyectos ágiles. 
          A partir de un prompt, genera automáticamente requerimientos funcionales, historias 
          de usuario y épicas usando inteligencia artificial, facilitando la organización y el 
          trabajo colaborativo.
        </p>
        <p className="login-text">
          Si todavía no tienes una cuenta,
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
            Ingresar
          </button>
        </form>
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Iniciando sesión...</p>
        </div>
      )}
      {/* Popup de error */}
      {/* Cierra el popup de error al limpiar el mensaje */}
      <ErrorPopup message={error} onClose={() => setError(null)} />
      {/* Popup de éxito */}
      {successMessage && (
        <SuccessPopup message={successMessage} onClose={handleSuccessClose} />
      )}
    </div>
  );
};

export default Login;
