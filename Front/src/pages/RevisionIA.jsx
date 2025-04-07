import React, { useState } from "react";
import "../css/RevisionIA.css";

function RevisionIA() {
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
    { id: "EP", title: "EP", fullText: "Epicas" }
  ];

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  return (
    <div className="page-container">
      {/* Header fuera del contenedor principal */}
      <div className="full-width-header">
        <h2>Revisión de datos</h2>
      </div>

      {/* Contenedor principal con el contenido centrado */}
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
            <tr>
              <td>Autenticación de usuario</td>
              <td className="stars">★★★★★☆</td>
            </tr>
            <tr>
              <td>Perfil de usuario</td>
              <td className="stars">★★★★★★</td>
            </tr>
            <tr>
              <td>Búsqueda y filtrado</td>
              <td className="stars">★★★★★☆</td>
            </tr>
            <tr>
              <td>Notificaciones push</td>
              <td className="stars">★★★★★★</td>
            </tr>
            <tr>
              <td>Integración con pasarelas de pago</td>
              <td className="stars">★★★★★☆</td>
            </tr>
            <tr>
              <td>Gestión de contenido</td>
              <td className="stars">★★★★★☆</td>
            </tr>
            <tr>
              <td>Geolocalización</td>
              <td className="stars">★★★★★☆</td>
            </tr>
            <tr>
              <td>Comunicación entre usuarios</td>
              <td className="stars">★★★★★★</td>
            </tr>
            <tr>
              <td>Soporte multiidioma</td>
              <td className="stars">★★★★★☆</td>
            </tr>
          </tbody>
          </table>
        </div>

        <div className="buttons">
          <button className="confirm">Confirmar</button>
          <button className="edit">Editar</button>
          <button className="delete">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default RevisionIA;