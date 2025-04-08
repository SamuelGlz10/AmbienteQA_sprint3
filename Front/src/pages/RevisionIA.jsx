import React, { useState, useEffect } from "react";
<<<<<<< HEAD
=======
import DragAndDropTable from "../components/DragAndDropTable.jsx";
>>>>>>> 6bfcbbcc98966450ad17d472376a67e8aaaddac7
import "../css/RevisionIA.css";

function RevisionIA() {
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);
<<<<<<< HEAD
  const [ratings, setRatings] = useState({
    RF: {},
    RNF: {},
    HU: {},
    EP: {}
  });
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState("");
=======
  const [ratings, setRatings] = useState({});
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    // Cargar los datos desde la API
    const fetchData = async () => {
      try {
        const requirementsResponse = await fetch("http://localhost:5001/projectsFB/");
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
>>>>>>> 6bfcbbcc98966450ad17d472376a67e8aaaddac7

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
<<<<<<< HEAD
    { id: "EP", title: "EP", fullText: "Epicas" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mockData = {
          nombreProyecto: "The name of the project",
          descripcion: "A brief description of the project",
          estatus: "Abierto",
          fechaCreacion: "2023-01-01",
          EP: [
            { id: "EP01", titulo: "Titulo de Epica", data: "Descripcion de epica" }
          ],
          RF: [
            { id: "RF01", titulo: "Titulo de Requerimiento", data: "Descricpcion de requerimiento" }
          ],
          RNF: [
            { id: "FNR01", titulo: "Titulo de Requerimiento", data: "Descricpcion de requerimiento" }
          ],
          HU: [
            { id: "HU01", titulo: "Titulo de historia de usuario", data: "Descripcion de historia de usuario (usar estructura [Yo como X quiero X para X])" }
          ]
        };
        
        setProjectData(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);
=======
    { id: "EP", title: "EP", fullText: "Epicas" },
  ];
>>>>>>> 6bfcbbcc98966450ad17d472376a67e8aaaddac7

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

<<<<<<< HEAD
  const InteractiveStars = ({ tabId, requirementId }) => {
    const currentRating = ratings[tabId]?.[requirementId] || 0;
    
    const handleStarClick = (selectedRating) => {
      setRatings(prev => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          [requirementId]: selectedRating
        }
      }));
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

  const handleDeleteItem = (tabId, id) => {
    if (!projectData) return;
    
    setProjectData(prev => ({
      ...prev,
      [tabId]: prev[tabId].filter(req => req.id !== id)
    }));
    
    setRatings(prev => {
      const newRatings = {...prev};
      if (newRatings[tabId]?.[id]) {
        delete newRatings[tabId][id];
      }
      return newRatings;
    });
  };

  const toggleDeleteMode = () => {
    setShowDeleteIcons(!showDeleteIcons);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setEditData(item.data);
    setEditing(false);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditing(false);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedItem || !projectData) return;
    
    setProjectData(prev => {
      const updatedTab = [...prev[activeTab]];
      const itemIndex = updatedTab.findIndex(item => item.id === selectedItem.id);
      if (itemIndex !== -1) {
        updatedTab[itemIndex] = {
          ...updatedTab[itemIndex],
          data: editData
        };
      }
      
      return {
        ...prev,
        [activeTab]: updatedTab
      };
    });
    
    setEditing(false);
  };

  const handleEditChange = (e) => {
    setEditData(e.target.value);
  };

  if (loading) {
    return <div className="page-container">Cargando datos...</div>;
  }

  if (!projectData) {
    return <div className="page-container">No se pudieron cargar los datos del proyecto.</div>;
  }

=======
>>>>>>> 6bfcbbcc98966450ad17d472376a67e8aaaddac7
  return (
    <div className="page-container">
      <div className="full-width-header">
        <h2>Revisión de datos - {projectData.nombreProyecto}</h2>
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

<<<<<<< HEAD
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>{activeTab === "RF" ? "Requerimientos funcionales" : 
                     activeTab === "RNF" ? "Requerimientos no funcionales" :
                     activeTab === "HU" ? "Historias de usuario" : "Epicas"}</th>
                <th>Valoración</th>
                {showDeleteIcons && <th></th>}
              </tr>
            </thead>
            <tbody>
              {projectData[activeTab]?.map((req) => (
                <tr key={req.id}>
                  <td 
                    className="clickable-title"
                    onClick={() => handleItemClick(req)}
                  >
                    {req.titulo}
                  </td>
                  <td>
                    <InteractiveStars tabId={activeTab} requirementId={req.id} />
                  </td>
                  {showDeleteIcons && (
                    <td className="delete-cell">
                      <button 
                        className="delete-icon" 
                        onClick={() => handleDeleteItem(activeTab, req.id)}
                        aria-label="Eliminar"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="buttons">
          <button 
            className="confirm"
            onClick={() => console.log("Ratings guardados:", {projectData, ratings})}
          >
            Confirmar
          </button>
          <button 
            className="delete"
            onClick={toggleDeleteMode}
          >
            {showDeleteIcons ? "Cancelar" : "Eliminar"}
          </button>
        </div>
=======
        <DragAndDropTable
          requirements={requirements}
          setRequirements={setRequirements}
          ratings={ratings}
          setRatings={setRatings}
        />
>>>>>>> 6bfcbbcc98966450ad17d472376a67e8aaaddac7
      </div>

      {/* Popup para mostrar detalles */}
      {showPopup && selectedItem && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>×</button>
            <h3 className="popup-title">{selectedItem.titulo}</h3>
            <div className="popup-details">
              <p><strong>ID:</strong> {selectedItem.id}</p>
              <p><strong>Descripción:</strong></p>
              {editing ? (
                <textarea
                  value={editData}
                  onChange={handleEditChange}
                  className="edit-textarea"
                  rows="5"
                />
              ) : (
                <p>{selectedItem.data}</p>
              )}
            </div>
            <div className="popup-footer">
              {editing ? (
                <button className="popup-save" onClick={handleSaveEdit}>
                  Guardar cambios
                </button>
              ) : (
                <button className="popup-edit" onClick={handleEditClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RevisionIA;