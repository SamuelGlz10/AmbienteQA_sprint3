import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Registro.css"; 

const Registro = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [appellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !correo || !telefono || !contrasena || !confirmar) {
      alert("Por favor llena todos los campos.");
      return;
    }

    if (contrasena !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const response = await fetch("http://localhost:5001/register", {
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
      alert("¡Registro exitoso!");
      navigate("/login");
    } else {
      const errorData = await response.json();
      alert(`Error al registrarse: ${errorData.message || "Error desconocido"}`);
    }
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
        <img src="/Login.png" alt="Login Illustration" className="illustration" />
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
      </div>
  );
};

export default Registro;



