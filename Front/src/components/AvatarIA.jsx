import React, { useState, useRef, useEffect } from "react";
import "../css/AvatarIA.css";
import siteInfo from "../data/siteContext.json"; // <— nuevo import

const AvatarIA = () => {
  const [sessionId] = useState(() => {
    let id = localStorage.getItem("df-session-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("df-session-id", id);
    }
    return id;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupAnimation, setPopupAnimation] = useState(""); // nueva variable para animación
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¿En qué te puedo ayudar?", sender: "other" },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // ref para el contenedor de mensajes
  const messagesRef = useRef(null);

  // efecto para autoscroll al agregar mensajes
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // nuevo efecto: al abrir el chat, desplazar hasta abajo
  useEffect(() => {
    if (showChat && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [showChat]);

  const handleTogglePopup = () => {
    if (!showPopup) {
      setShowPopup(true);
      setPopupAnimation("slideIn");
    } else {
      setPopupAnimation("slideOut");
      setTimeout(() => {
        setShowPopup(false);
      }, 300); // duración de la animación
      setShowChat(false); // Cerrar el chat si el popup se cierra
    }
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
    if (!text || isLoading) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setCurrentMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/dialogflow/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
        }),
      });

      const { fulfillmentText } = await response.json();
      setMessages((prev) => [
        ...prev,
        { text: fulfillmentText, sender: "other" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Error al comunicarse con Dialogflow.", sender: "other" },
      ]);
    } finally {
      setIsLoading(false);
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
          <div
            className={`ia-popup-sidebar ${popupAnimation}`}
            onClick={(e) => e.stopPropagation()}
          >
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
                  {isLoading && (
                    <p className="chat-message other-message thinking-message">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </p>
                  )}
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Escribe un mensaje..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                  />
                  <button
                    className="chat-send-button"
                    onClick={handleSendMessage}
                    disabled={isLoading}
                  >
                    <span className="material-icons">
                      {isLoading ? "hourglass_empty" : "arrow_upward"}
                    </span>
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
