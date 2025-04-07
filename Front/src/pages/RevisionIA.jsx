import React, { useState } from "react";
import "../css/RevisionIA.css";

function RevisionIA() {
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);
  const [ratings, setRatings] = useState({}); // Almacena los ratings por requisito

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
    { id: "EP", title: "EP", fullText: "Epicas" }
  ];

  // Datos de ejemplo
  const requirements = [
    { id: 1, name: "Autenticación de usuario" },
    { id: 2, name: "Perfil de usuario" },
    { id: 3, name: "Búsqueda y filtrado" },
    { id: 4, name: "Notificaciones push" },
    { id: 5, name: "Integración con pasarelas de pago" },
    { id: 6, name: "Gestión de contenido" },
    { id: 7, name: "Geolocalización" },
    { id: 8, name: "Comunicación entre usuarios" },
    { id: 9, name: "Soporte multiidioma" }
  ];

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  // Componente para las estrellas interactivas
  const InteractiveStars = ({ requirementId }) => {
    const currentRating = ratings[requirementId] || 0;
    
    const handleStarClick = (selectedRating) => {
      setRatings({
        ...ratings,
        [requirementId]: selectedRating
      });
    };

    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= currentRating ? 'filled' : ''}`}
            onClick={() => handleStarClick(star)}
          >
            {star <= currentRating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="full-width-header">
        <h2>Revisión de datos</h2>
      </div>

      <div className="revision-container">
        <div className="tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""} ${
                expandedTab === tab.id ? "expanded" : ""
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                toggleExpand(tab.id);
              }}
            >
              <span className="tab-title">{tab.title}</span>
              {expandedTab === tab.id && (
                <span className="tab-full-text"> - {tab.fullText}</span>
              )}
            </button>
          ))}
        </div>

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Requerimientos</th>
                <th>Valoración</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>
                    <InteractiveStars requirementId={req.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="buttons">
          <button 
            className="confirm"
            onClick={() => console.log("Ratings guardados:", ratings)}
          >
            Confirmar
          </button>
          <button className="edit">Editar</button>
          <button className="delete">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default RevisionIA;