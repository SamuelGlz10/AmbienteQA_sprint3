import React, { useState, useEffect } from "react";
import DragAndDropTable from "../components/DragAndDropTable.jsx";
import "../css/RevisionIA.css";

function RevisionIA() {
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);
  const [ratings, setRatings] = useState({});
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    // Cargar los datos desde la API
    const fetchData = async () => {
      try {
        const requirementsResponse = await fetch("http://localhost:5001/api/projectsFB/");
        if (!requirementsResponse.ok) {
          throw new Error(`Error HTTP: ${requirementsResponse.status}`);
        }
        const requirementsData = await requirementsResponse.json();
        setRequirements(requirementsData);
      } catch (error) {
        console.error("Error al cargar los datos desde la API:", error);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
    { id: "EP", title: "EP", fullText: "Epicas" },
  ];

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
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

        <DragAndDropTable
          requirements={requirements}
          setRequirements={setRequirements}
          ratings={ratings}
          setRatings={setRatings}
        />
      </div>
    </div>
  );
}

export default RevisionIA;