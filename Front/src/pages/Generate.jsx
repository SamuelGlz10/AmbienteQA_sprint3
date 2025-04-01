import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField } from "@mui/material";
import "../css/Generate.css"; // Importa el archivo CSS para estilos personalizados

function Generate() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [copiarText, setCopiarText] = useState("Copiar"); // Estado para controlar el texto copiado
  const [pegarText, setPegarText] = useState("Pegar"); // Estado para controlar el texto pegado
  const [selectedOption, setSelectedOption] = useState("MAX"); // Estado para controlar la opción seleccionada

  const onSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim() === "") {
      alert("Por favor, ingresa un prompt apropiado.");
      return;
    }
    const input = prompt;
    const structuredPrompt =
      "Please create a JSON object that returns headers with 'title' of the generated text, 'data' being the actual text generated from the following prompt. Do not include aditional text inside or outside the json. Do not include the word json or any punctuation of any kind. The output should only be the brackets from the json and its content: " +
      input;
    alert("Solicitud recibida, generando texto..." + structuredPrompt); // Aquí se muestra el mensaje de que se recibió la solicitud
    const result = await fetch("http://localhost:5001/generateEpic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: structuredPrompt }),
    });
    const response = await result.json();
    const generatedText = response.data;
    navigate("/home", { state: { generatedText } }); // Regresar el texto generado a la página de inicio
    alert(generatedText); // Aquí se muestra el mensaje de que se generó el texto
  };

  const handleErase = () => {
    setPrompt(""); // Limpiar el campo de entrada
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopiarText("¡Texto copiado!"); // Cambiar el texto del botón a "Texto copiado!"
    setPegarText("Pegar"); // Cambiar el texto del botón a "Pegar"

    setTimeout(() => {
      setCopiarText("Copiar"); // Cambiar el texto del botón a "Copiar" después de 2 segundos
    }, 2000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setPrompt(prompt + text); // Actualizar el estado del prompt sumando el texto pegado
    setPegarText("¡Texto pegado!"); // Cambiar el texto del botón a "Texto pegado!"
    setCopiarText("Copiar"); // Cambiar el texto del botón a "Copiar"

    setTimeout(() => {
      setPegarText("Pegar"); // Cambiar el texto del botón a "Pegar" después de 2 segundos
    }, 2000);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option); // Actualizar el estado de la opción seleccionada
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <Box // Cuerpo de pagina
          margin={"auto"}
          width={1280}
          flexDirection={"row"}
          justifyContent={"space-between"}
          display={"flex"}
          marginTop={10}
        >
          <div>
            <Box className="pink-box">
              {/* Caja de prompt */}
              <span className="prompt-text">
                <p>Prompt:</p>
                <span className="button-container" id="button-container-right">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleCopy} // Copia el texto del prompt
                  >
                    {copiarText}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handlePaste} // Pega el texto del portapapeles en el prompt
                  >
                    {pegarText}
                  </button>
                </span>
              </span>
              <TextField
                className={"login-input"}
                name={"prompt"}
                id={"prompt"}
                variant={"outlined"}
                margin={"normal"}
                multiline={true}
                rows={14}
                autoComplete="off"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)} // Actualiza el estado del prompt
                // Se utiliza para modificar el estilo de los elementos internos del TextField de mui materials:
                slotProps={{
                  // inputLabel: {
                  //   // Label del TextField
                  //   sx: {
                  //     color: "#000000",
                  //   },
                  // },
                  htmlInput: {
                    // Texto del TextField
                    sx: {
                      color: "#000000",
                    },
                  },
                  input: {
                    // Input del Fondo
                    sx: {
                      backgroundColor: "#FFFFFF",
                    },
                  },
                }}
              />
            </Box>
            <span className="button-container">
              <button className="main-button" type="submit">
                Generar
              </button>
              <button
                className="main-button"
                type="button"
                onClick={handleErase}
              >
                Eliminar
              </button>
            </span>
          </div>
          <Box className="pink-box">
            <span className="prompt-options-text">
              <p id="prompt-options">Opciones:</p>
            </span>

            <span className="prompt-options-container">
              <p>Nivel de detalle:</p>
              <select className="select-options">
                <option value="1">Bajo</option>
                <option value="2">Medio</option>
                <option value="3">Alto</option>
              </select>
            </span>

            <span className="prompt-options-container">
              <p>Límite de lista:</p>
              <button
                className="secondary-button"
                id="prompt-options-button"
                type="button"
                style={{
                  // Aplicar estilos condicionales
                  textDecoration:
                    selectedOption === "MAX" ? "underline" : "none",
                }}
                onClick={() => handleOptionSelect("MAX")} // Cambia el estado de la opción seleccionada a "MAX"
              >
                MAX
              </button>
              <button
                className="secondary-button"
                id="prompt-options-button"
                type="button"
                style={{
                  textDecoration:
                    selectedOption === "MIN" ? "underline" : "none",
                }}
                onClick={() => handleOptionSelect("MIN")} // Cambia el estado de la opción seleccionada a "MIN"
              >
                MIN
              </button>
              <input
                className="input-options"
                type="number"
                min="0"
                max="25"
                placeholder="0"
              />
            </span>

            <span className="prompt-options-text" style={{ marginTop: "10px" }}>
              <p id="prompt-options">Historial:</p>
            </span>
          </Box>
        </Box>
      </form>
    </div>
  );
}

export default Generate;
