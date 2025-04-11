import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField } from "@mui/material";
import "../css/Generate.css";

function Generate() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [copiarText, setCopiarText] = useState("Copiar"); // Estado para controlar el texto copiado
  const [pegarText, setPegarText] = useState("Pegar"); // Estado para controlar el texto pegado
  const [selectedDetail, setSelectedDetail] = useState("Bajo");
  const [selectedOption, setSelectedOption] = useState("MAX"); // Estado para controlar la opción seleccionada
  const [limit, setLimit] = useState(1); // Estado para controlar el límite
  const [history, setHistory] = useState([]); // Estado para controlar el historial
  const [loading, setLoading] = useState(false); // Estado para controlar el estado de carga

  const promptRules = `Please create a JSON object with the following structure: 

  {
    'nombreProyecto': 'The name of the project',
    'descripcion': 'A brief description of the project',
    'estatus': 'Abierto/Cerrado',
    'EP': [
      { 'id': 'EP01', 'titulo': 'Titulo de Epica', 'data': 'Descripcion de epica' }
    ],
    'RF': [
      { 'id': 'RF01', 'titulo': 'Titulo de Requerimiento', 'data': 'Descricpcion de requerimiento' }
    ],
    'RNF': [
      { 'id': 'RNF01', 'titulo': 'Titulo de Requerimiento', 'data': 'Descricpcion de requerimiento' }
    ],
    'HU': [
      { 'id': 'HU01', 'titulo': 'Titulo de historia de usuario', 'data': 'Descripcion de historia de usuario (usar estructura [Yo como X quiero X para X])' }
    ]
  }
  The number of elements in each list should be ${selectedOption} ${limit}, respecting any constraints given by MAX or MIN values. 
  Please do not include \`\`\`json or \`\`\` markers in the response.
  Do not include additional text inside or outside the JSON. Do not make up data that has not been asked: `;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/generateEpic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, rules: promptRules }),
      });
      const { data } = await response.json();

      // Limpia el JSON (remueve ```json y comillas simples)
      const cleanJSON = data
        .replace(/```json|```/g, "")
        .replace(/'/g, '"')
        .trim();
      console.log("JSON limpio:", cleanJSON);

      // Valida y envía
      JSON.parse(cleanJSON); // Si falla, lanzará error
      navigate("/revisionIA", { state: { generatedText: cleanJSON } });
    } catch (error) {
      alert("Error: El JSON generado no es válido. Verifica la consola.");
      console.error("Error al procesar JSON:", error);
    } finally {
      setLoading(false);
    }
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

  const addToHistory = (prompt) => {
    setHistory((prevHistory) => {
      const newHistory = [prompt, ...prevHistory]; // Agregar el nuevo prompt al historial
      return newHistory.slice(0, 4);
    });
  };

  const handleHistorialClick = (item) => {
    setPrompt(item); // Actualizar el prompt con el elemento del historial seleccionado
  };

  return (
<div className="white-container">
  <div className="logo-container">
    <img src="/softedge_logo2.png" alt="SoftEdge Logo" className="softedge-logo" />
  
  </div>
  <div className="generate-container">
    <div className="main-title">
      <h1>Creación con IA</h1>
    </div>

      <button className="back-button" onClick={() => navigate("/home")}>
        ←
      </button>

      <form onSubmit={onSubmit}>
        <div className="content-container">
          <div className="left-container">
            <Box className="pink-box">
              <div className="prompt-text">
                <p>Prompt:</p>
                <div id="button-container-right">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCopy}
                  >
                    {copiarText}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handlePaste}
                  >
                    {pegarText}
                  </button>
                </div>
              </div>

              <TextField
                name="prompt"
                id="prompt"
                variant="outlined"
                multiline
                rows={12}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "'Poppins', sans-serif",
                    "& fieldset": {
                      borderColor: "#ddd",
                    },
                    "&:hover fieldset": {
                      borderColor: "#9370DB",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#9370DB",
                    },
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "'Poppins', sans-serif",
                  },
                }}
              />

              <div className="button-container">
                <button
                  className="main-button"
                  type="submit"
                  disabled={loading}
                >
                  Generar
                </button>
                <button
                  className="main-button"
                  type="button"
                  onClick={handleErase}
                >
                  Eliminar
                </button>
              </div>
            </Box>
          </div>

          <div className="right-container">
            <Box className="pink-box">
              <div className="prompt-options-text">
                <p>Opciones:</p>
              </div>

              <div className="prompt-options-container">
                <span>Nivel de detalle:</span>
                <select
                  value={selectedDetail}
                  onChange={(e) => setSelectedDetail(e.target.value)}
                >
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>

              <div className="prompt-options-container">
                <span>Límite de lista:</span>
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setSelectedOption("MAX")}
                    style={{
                      backgroundColor:
                        selectedOption === "MAX" ? "#9e72be" : "#f0e6ff",
                      textDecoration:
                        selectedOption === "MAX" ? "underline" : "none",
                      color: selectedOption === "MAX" ? "#fff" : "#9e72be",
                    }}
                  >
                    MAX
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setSelectedOption("MIN")}
                    style={{
                      backgroundColor:
                        selectedOption === "MIN" ? "#9e72be" : "#f0e6ff",
                      textDecoration:
                        selectedOption === "MIN" ? "underline" : "none",
                      color: selectedOption === "MIN" ? "#fff" : "#9e72be",
                    }}
                  >
                    MIN
                  </button>
                  <input
                    type="number"
                    value={limit}
                    min="1"
                    onChange={(e) => setLimit(e.target.value)}
                    style={{
                      width: "60px",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div className="prompt-options-text">
                <p>Historial:</p>
              </div>
              <div className="history-container">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="history-item"
                    onClick={() => handleHistorialClick(item)}
                  >
                    <span>{item || ""}</span>
                  </div>
                ))}
              </div>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setHistory([])}
                style={{ width: "100%", marginBottom: "15px" }}
              >
                Limpiar
              </button>
            </Box>
          </div>
        </div>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generando texto, por favor espere...</p>
        </div>
      )}
          </div>
    </div>
  );
}

export default Generate;