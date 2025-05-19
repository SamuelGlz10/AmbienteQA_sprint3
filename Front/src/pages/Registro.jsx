import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el popup de éxito
import "../css/Registro.css";

const Registro = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [appellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !correo || !telefono || !contrasena || !confirmar) {
      setError("Por favor llena todos los campos."); // Muestra el popup de error
      return;
    }

    if (contrasena !== confirmar) {
      setError("Las contraseñas no coinciden."); // Muestra el popup de error
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/registro`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: usuario,
        lastname: appellido,
        email: correo,
        phone: telefono,
        password: contrasena,
      }),
    });

      if (response.ok) {
        setSuccessMessage("¡Registro exitoso! Redirigiendo al inicio de sesión..."); // Muestra el popup de éxito
      } else {
        const data = await response.json();
        setError(data.message || "Error al registrarse"); // Muestra el popup de error
      };
    } catch (error) {
      setError("Error al conectar con el servidor"); // Muestra el popup de error
    }
  };

  const closeErrorPopup = () => {
    setError(null); // Cierra el popup de error
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null); // Cierra el popup de éxito
    navigate("/login"); // Redirige al login después de cerrar el popup
  };

  return (
    <div className="registro-container">
      <div className="registro-left">
        <img src="/softedge_logo.png" alt="Logo Softedge" className="logo" />
        <h1 className="title">Regístrate</h1>
        <h2 className="subtitle">FRIDA Product Planner</h2>
        <p className="login-text">
          Si ya tienes una cuenta <br />
          <span className="login-link" onClick={() => navigate("/login")}>
            ¡Inicia Sesión!
          </span>
        </p>
        <img
          src="/Login.png"
          alt="Login Illustration"
          className="illustration"
        />
      </div>

      <div className="registro-right">
        <form className="form" onSubmit={onSubmit}>
          <h2 className="form-title">Regístrate</h2>
          <input
            className="input"
            type="email"
            placeholder="Correo Electrónico"
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Nombre"
            onChange={(e) => setUsuario(e.target.value)}
          />
          <input
            className="input"
            type="text"
            placeholder="Apellido"
            onChange={(e) => setApellido(e.target.value)}
          />
          <input
            className="input"
            type="tel"
            placeholder="Número de Teléfono"
            onChange={(e) => setTelefono(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setContrasena(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Confirma tu Contraseña"
            onChange={(e) => setConfirmar(e.target.value)}
          />
          <button type="submit" className="main-button">
            Regístrate
          </button>
        </form>
      </div>

      {/* Popup de error */}
      <ErrorPopup message={error} onClose={closeErrorPopup} />

      {/* Popup de éxito */}
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />
    </div>
  );
}

export default Registro;
