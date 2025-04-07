import { Box, TextField, Typography, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../css/Login.css"; // Asegúrate de que la ruta es correcta

const Login = ({ tryLogin }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
    if (!username || !password) {
      alert("Favor de llenar todos los campos.");
      return;
    }

    const isLogin = await tryLogin({ username, password });

    if (isLogin) {
      setUsername("");
      setPassword("");
      alert("Login logrado!");
      navigate("/dungeon");
    } else {
      alert("Login fallido: Usuario o contraseña incorrectos.");
    }
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
        <a href="/register" className="register-link">¡Regístrate Aquí!</a>
        </p>
        <img src="/Login.png" alt="Login Illustration" className="illustration" />
      </div>

      <div className="login-right">
        <form className="form" onSubmit={onsubmit}>
          <h2 className="form-title">Inicio de Sesión</h2>
          <input
            className="input"
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
    </div>
  );
};

export default Login;