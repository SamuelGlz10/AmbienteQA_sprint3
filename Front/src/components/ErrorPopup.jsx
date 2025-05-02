import React, {useEffect} from "react";
import "../css/ErrorPopup.css";

const ErrorPopup = ({ message, onClose }) => {
  if (!message) return null; // Si no hay mensaje, no renderiza nada

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter") {
        onClose(); // Close the popup on Esc or Enter
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Clean up the listener
    };
  }, [onClose]);

  return (
    <div className="error-popup-overlay" onClick={onClose}>
      <div className="error-popup-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="error-popup-title">¡Error!</h3>
        <p className="error-popup-message">{message}</p>
        <button className="error-popup-continue" onClick={onClose}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;
