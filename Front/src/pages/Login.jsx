import { Box, Button, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../css/Login.css";

const Login = ({ tryLogin }) => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const getTest = async () => {
    const result = await fetch("http://localhost:5001");
    console.log(result);
    const text = await result.text();
    console.log(text);
    setMessage(text);
  };

  // Hook para cargar el mensaje al cargar la página
  useEffect(() => {
    getTest();
  }, []);

  const onsubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Favor de llenar todos los campos.");
      return;
    }

    const isLogin = await tryLogin({ username, password }); // Esto da un objeto "abstracto" con propiedades 'usernam' y 'password'

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
    <form onSubmit={onsubmit}>
      <Box
        margin={"auto"}
        flexDirection={"column"}
        display={"flex"}
        width={400}
        marginTop={10}
      >
        <h1>Inicio de Sesión</h1>
        {message !== "" ? <p>{message}</p> : <p>Mensaje aun no recibido...</p>}
        <TextField
          className={"login-input"}
          id={"login-input"}
          label={"Usuario o Correo Electrónico"}
          variant={"outlined"}
          margin={"normal"}
          autoComplete="off"
          onChange={(e) => setUsername(e.target.value)}
          // Se utiliza para modificar el estilo de los elementos internos del TextField de mui materials:
          slotProps={{
            inputLabel: {
              sx: {
                color: "#9e72be",
              },
            },
          }}
        />
        <TextField
          className={"login-input"}
          label={"Contraseña"}
          variant={"outlined"}
          margin={"normal"}
          type={"password"}
          onChange={(e) => setPassword(e.target.value)}
          // Se utiliza para modificar el estilo de los elementos internos del TextField de mui materials:
          slotProps={{
            inputLabel: {
              sx: {
                color: "#9e72be",
              },
            },
          }}
        />
        <button
          type={"submit"}
          variant={"contained"}
          className={"main-button"}
          id={"login-button"}
        >
          Iniciar Sesión
        </button>
      </Box>
    </form>
  );
};

export default Login;
