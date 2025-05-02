import React, { useEffect } from "react";
import "../css/Generate.css";

const ConfirmationPopup = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message = "",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  canUndo = false,
  loading = false,
  confirmButtonStyle = {},
}) => {
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose(); // Close the popup on Esc
      } else if (e.key === "Enter") {
        onConfirm(); // Confirm action on Enter
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Clean up the listener
    };
  }, [isVisible, onClose, onConfirm]);

  if (!isVisible) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-content confirmation-popup"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        style={{ minWidth: "500px", textAlign: "center" }}
      >
        <button className="popup-close" onClick={onClose}>
          ×
        </button>
        <h3>{title}</h3>
        <p>{message}</p>
        {!canUndo && <p>Esta acción no se puede deshacer.</p>}
        <div className="confirmation-actions">
          <button className="cancel-button" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="popup-button delete"
            onClick={onConfirm}
            disabled={loading}
            style={confirmButtonStyle}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
