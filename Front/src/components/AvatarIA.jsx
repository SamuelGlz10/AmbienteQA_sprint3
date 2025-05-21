import React, { useState } from "react";
import "../css/AvatarIA.css";

const AvatarIA = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleTogglePopup = () => {
    if (showPopup) {
      setIsClosing(true);
      setTimeout(() => {
        setShowPopup(false);
        setIsClosing(false);
      }, 500); // Match the duration of the closing animation
    } else {
      setShowPopup(true);
    }
  };

  return (
    <>
      {!showPopup && (
        <button className="avatar-ia" onClick={handleTogglePopup}>
          IA
        </button>
      )}
      {showPopup && (
        <div className={`ia-popup-small ${isClosing ? "closing" : ""}`}>
          <h2>Chat con IA</h2>
          <div className="iframe-container">
            <iframe
              width="300"
              height="300"
              allow="microphone;"
              src="https://console.dialogflow.com/api-client/demo/embedded/57b16256-d364-462b-b62a-0117c98afbfe"
              title="Dialogflow Chat"
            ></iframe>
          </div>
          <button className="ia-popup-close" onClick={handleTogglePopup}>
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default AvatarIA;
