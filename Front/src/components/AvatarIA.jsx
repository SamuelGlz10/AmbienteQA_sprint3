import React, { useState, useRef, useEffect } from "react";
import "../css/AvatarIA.css";
import chatbotImage from "../../public/icons/chatbot.png"; // Import the chatbot image

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
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¿En qué te puedo ayudar?", sender: "other" },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isRecording, setIsRecording] = useState(false); // State for recording
  const [isProcessingVoice, setIsProcessingVoice] = useState(false); // State for processing voice
  const [isSpeaking, setIsSpeaking] = useState(false); // State for TTS playback
  const recognitionRef = useRef(null); // Ref for SpeechRecognition instance
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

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    if (window.speechSynthesis.getVoices().length) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleVoiceMessage = async (text) => {
    if (!text || isLoading) return;
    setIsProcessingVoice(false); // Clear processing state
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, sender: "user" }]);

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

      // Establecer isSpeaking antes de quitar isLoading para evitar el parpadeo
      setIsSpeaking(true);
      setIsLoading(false);

      // Reproducir respuesta automáticamente en modo voz
      setTimeout(() => {
        handleReadMessage(fulfillmentText);
        // Mantener el popup abierto para continuar la conversación
      }, 100); // Reducir el delay para una transición más rápida
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Error al comunicarse con Dialogflow.", sender: "other" },
      ]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "es-MX";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        setIsProcessingVoice(false);
        
        if (showVoicePopup) {
          handleVoiceMessage(transcript);
        } else {
          setCurrentMessage(transcript);
          setTimeout(() => handleSendMessage(), 100);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsProcessingVoice(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        // No clear processing here, let onresult or onerror handle it
      };
    }
  }, [showVoicePopup, handleVoiceMessage]);

  const handleTogglePopup = () => {
    if (!showPopup) {
      setShowPopup(true);
      setPopupAnimation("slideIn");
    } else {
      setPopupAnimation("slideOut");
      setTimeout(() => {
        setShowPopup(false);
        setShowVoicePopup(false); // Cerrar popup de voz también
      }, 300);
      setShowChat(false);
    }
  };

  const handleOpenVoice = () => {
    setShowVoicePopup(true);
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
    if (!text || isLoading || isRecording) return;
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

  const handleReadMessage = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX"; // Set language to Spanish (Mexico)
    const selectedVoice =
      voices.find((voice) => voice.name.includes("Microsoft Sabina")) || voices[0];
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // isSpeaking ya está establecido en handleVoiceMessage
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStartRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        setIsRecording(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsRecording(false);
      }
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        setIsRecording(false); // Set recording to false immediately
        setIsProcessingVoice(true); // Set processing state
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
        setIsRecording(false);
        setIsProcessingVoice(false);
      }
    }
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      handleStopRecording(); // Stop recording and send the message
    } else {
      handleStartRecording(); // Start recording
    }
  };

  return (
    <>
      <button className="avatar-ia" onClick={handleTogglePopup}>
        <img src={chatbotImage} alt="Chatbot" className="avatar-ia-image" />
      </button>
      {showPopup && (
        <div className="ia-popup-overlay" onClick={handleTogglePopup}>
          <div
            className={`ia-popup-sidebar ${popupAnimation}`}
            onClick={(e) => e.stopPropagation()}
          >
            {!showChat && !showVoicePopup ? (
              <>
                <h2>¿En qué te puedo ayudar?</h2>
                <div className="ia-popup-buttons">
                  <button className="ia-popup-button" onClick={handleOpenVoice}>
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
            ) : showVoicePopup ? (
              <div className="voice-container">
                <h2>Asistente de Voz</h2>
                <div className="voice-content">
                  <div className="voice-visualization">
                    <div className={`voice-circle ${isRecording ? 'recording' : ''} ${isLoading || isProcessingVoice ? 'processing' : ''}`}>
                      <div className="voice-inner-circle">
                        <span className="material-icons voice-icon">
                          {isLoading || isProcessingVoice ? 'hourglass_empty' : 'mic'}
                        </span>
                      </div>
                      {isRecording && (
                        <div className="voice-waves">
                          <div className="wave wave1"></div>
                          <div className="wave wave2"></div>
                          <div className="wave wave3"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="voice-status">
                    {isRecording ? (
                      <p className="status-text recording-text">🎤 Grabando... Toca para detener</p>
                    ) : isProcessingVoice ? (
                      <p className="status-text processing-text">⏳ Procesando tu mensaje...</p>
                    ) : isLoading ? (
                      <p className="status-text processing-text">⏳ Procesando tu mensaje...</p>
                    ) : isSpeaking ? (
                      <p className="status-text speaking-text">🔊 Reproduciendo mensaje...</p>
                    ) : (
                      <p className="status-text ready-text">💬 Toca el micrófono para hablar</p>
                    )}
                  </div>

                  {/* Solo mostrar el botón si no está procesando ni hablando */}
                  {!isProcessingVoice && !isLoading && !isSpeaking && (
                    <button
                      className={`voice-record-btn-large ${isRecording ? 'recording' : ''}`}
                      onClick={handleMicButtonClick}
                    >
                      <span className="material-icons">
                        {isRecording ? 'stop' : 'mic'}
                      </span>
                    </button>
                  )}
                </div>
                
                <button className="ia-popup-back" onClick={() => setShowVoicePopup(false)}>
                  ←
                </button>
              </div>
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
                      {msg.sender === "other" && (
                        <button
                          className="read-message-button"
                          onClick={() => handleReadMessage(msg.text)}
                        >
                          <span className="material-icons">volume_up</span>
                        </button>
                      )}
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
                  <button
                    className={`chat-mic-button ${isRecording ? "recording" : ""}`}
                    onClick={handleMicButtonClick}
                  >
                    <span className="material-icons">mic</span> {/* Always show "mic" icon */}
                  </button>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Escribe un mensaje..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading || isRecording} // bloquea input durante grabación
                  />
                  <button
                    className="chat-send-button"
                    onClick={handleSendMessage}
                    disabled={isLoading || isRecording} // bloquea envío durante grabación
                  >
                    <span className="material-icons">
                      {isRecording ? "mic" : isLoading ? "hourglass_empty" : "arrow_upward"} {/* Cambia ícono */}
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
