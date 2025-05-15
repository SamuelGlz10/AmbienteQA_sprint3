import React, { useState, useRef, useEffect } from "react";
import "../css/AvatarIA.css";

const AvatarIA = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¿En qué te puedo ayudar?", sender: "other" },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // ref para el contenedor de mensajes
  const messagesRef = useRef(null);

  // efecto para autoscroll al agregar mensajes
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
    setShowChat(false); // Cerrar el chat si el popup se cierra
  };

  // cargar contexto de proyecto y tareas al abrir chat
  const handleOpenChat = async () => {
    setShowChat(true);
    const token = localStorage.getItem("token");
    let projectContext = {};

    // extraer projectId de la ruta /project/:projectId
    const match = window.location.pathname.match(/\/project\/([^/]+)/);
    if (match) {
      const projectId = match[1];
      try {
        // obtener datos del proyecto
        const projRes = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (projRes.ok) projectContext = await projRes.json();

        // obtener todas las tareas asociadas
        const tasksRes = await fetch(
          `${BACKEND_URL}/projectsFB/${projectId}/all-tasks`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (tasksRes.ok) {
          const { tasks } = await tasksRes.json();
          projectContext.allTasks = tasks;
        }
      } catch {
        projectContext = {};
      }
    }

    // guardar en sesión para el prompt de IA
    sessionStorage.setItem("projectData", JSON.stringify(projectContext));
  };

  const handleSendMessage = async () => {
    const text = currentMessage.trim();
    if (!text) return;
    // mostrar mensaje del usuario
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setCurrentMessage("");

    // extraer contexto y parámetros
    const projectContext = JSON.parse(
      sessionStorage.getItem("projectData") || "{}"
    );
    const sprints = projectContext.sprintNumber || 1;
    const limit = 1;
    // actualizar instrucciones de la IA
    const rules = `Eres el asistente virtual de SoftEdge. Tienes acceso a la información de los proyectos del usuario (projectContext) y a la página actual (currentUrl). Responde preguntas sobre sus proyectos, características del sistema y uso de la plataforma segun te lo pregunten. Ofrece respuestas claras y entre mas cortas mejores, sin exceder lo necesario para entender la respuesta. Si dispones de datos en projectContext, ÚSALOS SIEMPRE para responder con precisión sobre el proyecto y las tareas.`;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BACKEND_URL}/generateEpic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: text,
          rules,
          sprints,
          limit,
          context: projectContext, // añadir contexto
          currentUrl: window.location.pathname, // añadir URL
        }),
      });

      const { data } = await response.json();
      const cleanJSON = data
        .replace(/```json|```/g, "")
        .replace(/'/g, '"')
        .trim();

      setMessages((prev) => [...prev, { text: cleanJSON, sender: "other" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Error al comunicarse con la IA.", sender: "other" },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <button className="avatar-ia" onClick={handleTogglePopup}>
        IA
      </button>
      {showPopup && (
        <div className="ia-popup-overlay" onClick={handleTogglePopup}>
          <div className="ia-popup-sidebar" onClick={(e) => e.stopPropagation()}>
            {!showChat ? (
              <>
                <h2>¿En qué te puedo ayudar?</h2>
                <div className="ia-popup-buttons">
                  <button className="ia-popup-button">
                    <span className="material-icons">mic</span>
                  </button>
                  <button className="ia-popup-button" onClick={handleOpenChat}>
                    <span className="material-icons">chat</span>
                  </button>
                </div>
                <button className="ia-popup-close" onClick={handleTogglePopup}>
                  ×
                </button>
              </>
            ) : (
              <div className="chat-container">
                <h2>Chat</h2>
                {/* contenedor de mensajes con ref */}
                <div className="chat-messages" ref={messagesRef}>
                  {messages.map((msg, index) => (
                    <p
                      key={index}
                      className={`chat-message ${
                        msg.sender === "user" ? "user-message" : "other-message"
                      }`}
                    >
                      {msg.text}
                    </p>
                  ))}
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Escribe un mensaje..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <button className="chat-send-button" onClick={handleSendMessage}>
                    <span className="material-icons">arrow_upward</span>
                  </button>
                </div>
                <button
                  className="ia-popup-back"
                  onClick={() => setShowChat(false)}
                >
                  ←
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarIA;
