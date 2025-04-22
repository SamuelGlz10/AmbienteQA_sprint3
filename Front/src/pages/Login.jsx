import { Box, TextField, Typography, Button } from "@mui/material";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../css/Login.css";

const Login = ({ tryLogin }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getTest = async () => {
    try {
      const result = await fetch("http://localhost:5001");
      const text = await result.text();
      console.log(text);
      if (!text.includes("<!DOCTYPE")) {
        setMessage(text);
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
    }
  };

  useEffect(() => {
    getTest();
  }, []);

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
