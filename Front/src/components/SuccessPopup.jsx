import React, { useEffect } from "react";
import "../css/SuccessPopup.css";

const SuccessPopup = ({ message, onClose }) => {
  if (!message) return null;

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
    <div className="success-popup-overlay">
      <div className="success-popup-content">
        <h3 className="success-popup-title">¡Éxito!</h3>
        <p className="success-popup-message">{message}</p>
        <button className="success-popup-continue" onClick={onClose}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;