import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import TopAppBar from "../components/TopAppBar";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import "../css/Generate.css";

function Generate() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [selectedOption, setSelectedOption] = useState("MIN"); // Estado para controlar la opción seleccionada
  const [limit, setLimit] = useState(1); // Estado para controlar el límite
  const [history, setHistory] = useState([]); // Estado para controlar el historial
  const [loading, setLoading] = useState(false); // Estado para controlar el estado de carga
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito
  const [sprints, setSprints] = useState(1); // Estado para controlar el número de sprints
  const [copyButtonText, setCopyButtonText] = useState("Copiar");
  const [pasteButtonText, setPasteButtonText] = useState("Pegar");
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const userID = localStorage.getItem("UserID");

  useEffect(() => {
    if (!userID) return;
    const allHistories = JSON.parse(localStorage.getItem("history")) || {};
    const userHistory = allHistories[userID] || [];
    setHistory(userHistory);
  }, [userID]);

  useEffect(() => {
    if (!userID) return;
    const allHistories = JSON.parse(localStorage.getItem("history")) || {};
    allHistories[userID] = history;
    localStorage.setItem("history", JSON.stringify(allHistories));
  }, [history, userID]);

  const promptRules = `Please create a JSON object with the following structure:
 {
   "nombreProyecto": "Nombre del proyecto",
   "descripcion": "Breve descripción del proyecto",
   "estatus": "Abierto" or "Cerrado",
   "sprints": '${sprints}',
   "EP": [
     {
       "id": "EP01",
       "titulo": "Título de la épica",
       "data": "Descripción de la épica",
       ]
     }
     // ...más épicas...
   ],
   'RF': [
       {
        'id': 'RF01',
        'titulo': 'Titulo de Requerimiento',
        'data': 'Descricpcion de requerimiento',
       ]
     }
     // ...más requerimientos funcionales... }
     ],
     'RNF': [
       {
        'id': 'RNF01',
        'titulo': 'Titulo de Requerimiento',
        'data': 'Descricpcion de requerimiento',
       ]
     }
     // ...más requerimientos no funcionales... } }
     ],
     'HU': [
       {
        'id': 'HU01',
        'titulo': 'Titulo de historia de usuario',
        'data': 'Descripcion de historia de usuario (usar estructura [Yo como X quiero X para X])',
        'epica': 'EP01',
        'criteriosAceptacion':
        [
          {
            'criterio': 'Criterio de aceptacion 1',
          }
          // ...más criterios de aceptación...
        ],
        "tasks":
        [
         {
           "id": "T04",
           "titulo": "Título de tarea",
           "descripcion": "Descripción de la tarea",
           "prioridad": "alta/ media/ baja",
           "asignados": "NULL",
           "estado": "En progreso",
           "sprint": "1",
         }
         // ...más tareas...
       ]
     }
     // ...más historias de usuario... } }
     ]
 }
 The number of elements in each list should be ${selectedOption} ${limit}, respecting any constraints given by MAX or MIN values.
 Tasks are not limited by the limit, but should be generated based on the user stories.
 You are allowed to provide more than the requested number of elements if enough data is available.
 The tasks should be generated based on the user stories, and each task should have a unique ID.
 The task ID should be in the format "T01", "T02", etc. Task IDs should be unique within the project.
 The 'epica' field in each user story should reference the ID of the corresponding epic.
 The sprint number under status should always be exactly ${sprints}.
 The sprint number inside each task should be a number between 1 and ${sprints}, and be sure to distribute all tasks across the sprints.
  Please do not include \`\`\`json or \`\`\` markers in the response.
  Do not include additional text inside or outside the JSON. Do not make up data that has not been asked: `;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Por favor, ingresa una descripción del proyecto.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/generateEpic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, rules: promptRules }),
      });
      const { data } = await response.json();

      const cleanJSON = data
        .replace(/```json|```/g, "")
        .replace(/'/g, '"')
        .trim();

      JSON.parse(cleanJSON);
      addToHistory(prompt);
      setSuccessMessage("Proyecto generado exitosamente");
      navigate("/revisionIA", { state: { generatedText: cleanJSON } });
    } catch (error) {
      setError("Error al generar el proyecto. Por favor, intenta de nuevo.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopyButtonText("¡Texto copiado!");
    setTimeout(() => setCopyButtonText("Copiar"), 3000); // Reset after 3 seconds
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPrompt(prompt + text);
      setPasteButtonText("¡Texto pegado!");
      setTimeout(() => setPasteButtonText("Pegar"), 3000); // Reset after 3 seconds
    } catch (err) {
      setError("No se pudo acceder al portapapeles");
    }
  };

   const handleErase = () => {
    setShowConfirmationPopup(true); // Show confirmation popup
  };
  
  const confirmErase = () => {
    setPrompt("");
    setShowConfirmationPopup(false); // Close the popup
  };
  
  const cancelErase = () => {
    setShowConfirmationPopup(false); // Close the popup without clearing
  };

  const addToHistory = (prompt) => {
    setHistory((prevHistory) => {
      const newHistory = [prompt, ...prevHistory]; // Agregar el nuevo prompt al historial
      return newHistory.slice(0, 4);
    });
  };

  return (
    <div className="generate-container">
      <TopAppBar />
      <div className="main-title">
        <button className="back-button" onClick={() => navigate("/home")}>
          ←
        </button>
        <h1>Generación de Proyecto con IA</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="content-container">
          <div className="left-container">
            <div className="prompt-container">
              <div className="prompt-header">
                <h2 className="prompt-title">Descripción del Proyecto</h2>
                <div className="prompt-actions">
                  <button
                    type="button"
                    className="action-button"
                    onClick={handleCopy}
                  >
                    {copyButtonText}
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={handlePaste}
                  >
                    {pasteButtonText}
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={handleErase}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <TextField
                name="prompt"
                multiline
                rows={12}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe tu proyecto aquí..."
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                    backgroundColor: "#f8f9fa",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                    },
                    "&:hover fieldset": {
                      borderColor: "#9e72be",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#9e72be",
                    },
                  },
                }}
              />

              <div className="button-container">
                <button
                  className="main-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Generando..." : "Generar"}
                </button>
                <button
                  className="main-button delete"
                  type="button"
                  onClick={handleErase}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <div className="right-container">
            <div className="prompt-options">
              <h3 className="options-title">Configuración de Generación</h3>
              <div className="option-group">
                <span className="option-label">Número de Sprints</span>
                <input
                  type="number"
                  className="option-input"
                  value={sprints || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setSprints(1);
                    } else {
                      setSprints(Math.max(1, Math.min(10, Number(value))));
                    }
                  }}
                  min={1}
                  max={10}
                />
              </div>

              <div className="option-group">
                <span className="option-label">Tipo de límite</span>
                <select
                  className="option-select"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                >
                  <option value="MAX">Máximo</option>
                  <option value="MIN">Mínimo</option>
                </select>
              </div>

              <div className="option-group">
                <span className="option-label">Límite de Elementos</span>
                <input
                  type="number"
                  className="option-input"
                  value={limit || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setLimit(0);
                    } else {
                      setLimit(Math.max(1, Math.min(10, Number(value))));
                    }
                  }}
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <div className="history-section">
              <h3 className="history-title">Historial de Prompts</h3>
              <div className="history-list">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="history-item"
                    onClick={() => setPrompt(item)}
                  >
                    <p className="history-text">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>

      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      {showConfirmationPopup && (
        <div className="confirmation-popup">
          <div className="confirmation-content">
            <h3>¿Estás seguro de que deseas limpiar el campo?</h3>
            <button onClick={confirmErase}>Sí</button>
            <button onClick={cancelErase}>No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Generate;
