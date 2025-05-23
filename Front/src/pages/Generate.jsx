import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";
import TopAppBar from "../components/TopAppBar";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import ConfirmationPopup from "../components/ConfirmationPopup";
import "../css/Generate.css";

function Generate() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [selectedOption, setSelectedOption] = useState("MIN");
  const [limit, setLimit] = useState(1);
  const [tasksPerStory, setTasksPerStory] = useState(3);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [sprints, setSprints] = useState(1);
  const [copyButtonText, setCopyButtonText] = useState("Copiar");
  const [pasteButtonText, setPasteButtonText] = useState("Pegar");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteAction, setDeleteAction] = useState("");

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
   "sprintNumber": ${sprints},
   "estatus": "Abierto" or "Cerrado",
   "EP": [
     {
       "id": "EP01",
       "titulo": "Título de la épica",
       "data": "Descripción de la épica"
     }
   ],
   "RF": [
     {
       "id": "RF01",
       "titulo": "Titulo de Requerimiento",
       "data": "Descricpcion de requerimiento"
     }
   ],
   "RNF": [
     {
       "id": "RNF01",
       "titulo": "Titulo de Requerimiento",
       "data": "Descricpcion de requerimiento"
     }
   ],
   "HU": [
     {
       "id": "HU01",
       "titulo": "Titulo de historia de usuario",
       "data": "Descripcion de historia de usuario (usar estructura [Yo como X quiero X para X])",
       "epica": "EP01",
       "criteriosAceptacion": [
         {
           "criterio": "Criterio de aceptacion 1"
         }
       ],
       "tasks": [
         {
           "id": "T01",
           "titulo": "Título de tarea",
           "descripcion": "Descripción de la tarea",
           "prioridad": "alta/ media/ baja",
           "asignado": "NULL",
           "estado": "En progreso",
           "sprint": "1"
         }
       ]
     }
   ]
 }
 The number of elements in each list should be ${selectedOption} ${limit}.
 Each user story should have ${tasksPerStory} tasks.
 Tasks should be meaningful and cover all acceptance criteria.
 You MUST include the 'sprintNumber' for the generated project (value: ${sprints}).
 Task IDs should be unique within the project (format: T01, T02, etc.).
 Distribute tasks evenly across ${sprints} sprints.
 Do not include \`\`\`json or \`\`\` markers in the response.
 Response must be valid JSON only.`;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Por favor, ingresa una descripción del proyecto.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/generateEpic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          rules: promptRules, 
          sprints, 
          limit,
          tasksPerStory 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { data } = await response.json();

      const cleanJSON = data
        .replace(/```json|```/g, "")
        .replace(/'/g, '"')
        .trim();

      JSON.parse(cleanJSON); // Validar que sea JSON válido
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

  const handleCopy = async (e) => {
    await navigator.clipboard.writeText(prompt);
    e.target.blur();
    setCopyButtonText("¡Texto copiado!");
    setTimeout(() => setCopyButtonText("Copiar"), 3000);
  };

  const handlePaste = async (e) => {
    try {
      const text = await navigator.clipboard.readText();
      setPrompt(prompt + text);
      setPasteButtonText("¡Texto pegado!");
      e.target.blur();
      setTimeout(() => setPasteButtonText("Pegar"), 3000);
    } catch (err) {
      setError("No se pudo acceder al portapapeles");
    }
  };

  const handleErase = (e) => {
    e.target.blur();
    setDeleteAction("prompt");
    setShowDeleteConfirmation(true);
  };

  const handleDeleteHistory = (e) => {
    e.target.blur();
    setDeleteAction("history");
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (deleteAction === "prompt") {
      setPrompt("");
    } else if (deleteAction === "history") {
      setHistory([]);
      localStorage.setItem("history", JSON.stringify({ [userID]: [] }));
    }
    setShowDeleteConfirmation(false);
  };

  const addToHistory = (prompt) => {
    setHistory((prevHistory) => {
      const newHistory = [prompt, ...prevHistory];
      return newHistory.slice(0, 4);
    });
  };

  useEffect(() => {
    if (!showDeleteConfirmation) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowDeleteConfirmation(false);
      } else if (e.key === "Enter") {
        confirmDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDeleteConfirmation, confirmDelete]);

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
                    onClick={(e) => handleCopy(e)}
                  >
                    {copyButtonText}
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={(e) => handlePaste(e)}
                  >
                    {pasteButtonText}
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

              <div className="buttons-container">
                <button
                  className="generate-button"
                  onClick={onSubmit}
                  disabled={loading}
                >
                  {loading ? "Generando..." : "Generar"}
                </button>
                <button
                  type="button"
                  className="delete-button"
                  onClick={(e) => handleErase(e)}
                  disabled={loading}
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
                      setSprints("");
                    } else {
                      setSprints(Math.max(1, Math.min(10, Number(value))));
                    }
                  }}
                  onBlur={() => {
                    if (sprints === "") {
                      setSprints(1);
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

              <div className="option-group">
                <span className="option-label">Tareas por HU (referencia)</span>
                <input
                  type="number"
                  className="option-input"
                  value={tasksPerStory || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setTasksPerStory(0);
                    } else {
                      setTasksPerStory(Math.max(1, Math.min(10, Number(value))));
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
              {history.length > 0 && (
                <button
                  className="clear-history-button"
                  onClick={handleDeleteHistory}
                >
                  Limpiar Historial
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />

      <ConfirmationPopup
        isVisible={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message={
          deleteAction === "prompt"
            ? "¿Estás seguro que deseas limpiar el campo de descripción del proyecto?"
            : "¿Estás seguro que deseas eliminar el historial de prompts?"
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={loading}
      />
    </div>
  );
}

export default Generate;