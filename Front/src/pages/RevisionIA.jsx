import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/RevisionIA.css";

function RevisionIA() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);
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
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: null, success: false });

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
    { id: "EP", title: "EP", fullText: "Epicas" }
  ];

  // Transformar datos del formato Generate al formato que espera RevisionIA
  const transformGeneratedData = (generatedData) => {
    if (!generatedData) return null;
    
    return {
      nombreProyecto: generatedData.projectName || "Proyecto sin nombre",
      descripcion: generatedData.description || "Sin descripción",
      estatus: "Abierto",
      fechaCreacion: new Date().toISOString().split('T')[0],
      EP: generatedData.epics?.map((epic, i) => ({
        id: `EP${i+1}`,
        titulo: epic.title || `Épica ${i+1}`,
        data: epic.data || "Sin descripción"
      })) || [],
      RF: generatedData.functionalRequirements?.map((req, i) => ({
        id: `RF${i+1}`,
        titulo: req.title || `Requerimiento funcional ${i+1}`,
        data: req.data || "Sin descripción"
      })) || [],
      RNF: generatedData.nonFunctionalRequirements?.map((req, i) => ({
        id: `RNF${i+1}`,
        titulo: req.title || `Requerimiento no funcional ${i+1}`,
        data: req.data || "Sin descripción"
      })) || [],
      HU: generatedData.userStories?.map((story, i) => ({
        id: `HU${i+1}`,
        titulo: story.title || `Historia de usuario ${i+1}`,
        data: story.data || "Sin descripción"
      })) || []
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Primero intentar usar datos generados (si vienen de Generate)
        if (location.state?.generatedText) {
          try {
            const generatedData = JSON.parse(location.state.generatedText);
            const transformedData = transformGeneratedData(generatedData);
            setProjectData(transformedData);
          } catch (error) {
            console.error("Error parsing generated data:", error);
          }
        }
        // 2. Si no hay datos generados, cargar datos mock (para desarrollo)
        else {
          const mockData = transformGeneratedData({
            projectName: "Proyecto de ejemplo",
            description: "Este es un proyecto generado automáticamente",
            epics: [
              { title: "Épica principal", data: "Descripción de la épica principal" }
            ],
            functionalRequirements: [
              { title: "RF1", data: "El sistema debe permitir..." }
            ],
            nonFunctionalRequirements: [
              { title: "RNF1", data: "El sistema debe responder en menos de 2 segundos" }
            ],
            userStories: [
              { title: "HU1", data: "Como usuario quiero..." }
            ]
          });
          setProjectData(mockData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.state]);

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  const InteractiveStars = ({ tabId, requirementId, interactive = true }) => {
    const currentRating = ratings[tabId]?.[requirementId] || 0;
    
    const handleStarClick = (selectedRating) => {
      if (!interactive) return;
      
      setRatings(prev => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          [requirementId]: selectedRating
        }
      }));
    };

    return (
      <div className={`stars-container ${interactive ? 'interactive' : ''}`}>
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
    
    if (!window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      return;
    }
    
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
    setEditData({
      title: item.titulo,
      description: item.data
    });
    setEditing(false);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditing(false);
    setSaveStatus({ loading: false, error: null, success: false });
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !projectData) return;
    
    try {
      setSaveStatus({ loading: true, error: null, success: false });
      
      // Simular una llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProjectData(prev => {
        const updatedTab = [...prev[activeTab]];
        const itemIndex = updatedTab.findIndex(item => item.id === selectedItem.id);
        if (itemIndex !== -1) {
          updatedTab[itemIndex] = {
            ...updatedTab[itemIndex],
            titulo: editData.title,
            data: editData.description
          };
        }
        
        return {
          ...prev,
          [activeTab]: updatedTab
        };
      });
      
      setSaveStatus({ loading: false, error: null, success: true });
      setTimeout(() => setEditing(false), 1000);
    } catch (error) {
      setSaveStatus({ loading: false, error: "Error al guardar", success: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = () => {
    // Aquí iría la lógica para guardar todo en la base de datos
    console.log("Datos a guardar:", { projectData, ratings });
    alert("Proyecto confirmado y guardado correctamente");
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div></div>
          <p>Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h3>No se pudieron cargar los datos del proyecto</h3>
          <button onClick={() => navigate("/generate")}>
            Volver a Generar Proyecto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="full-width-header">
        <h2>Revisión de datos - {projectData.nombreProyecto}</h2>
        <p className="project-description">{projectData.descripcion}</p>
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

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  {activeTab === "RF" ? "Requerimientos funcionales" : 
                   activeTab === "RNF" ? "Requerimientos no funcionales" :
                   activeTab === "HU" ? "Historias de usuario" : "Epicas"}
                </th>
                <th>Valoración</th>
                {showDeleteIcons && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {projectData[activeTab]?.length > 0 ? (
                projectData[activeTab].map((req) => (
                  <tr key={req.id}>
                    <td 
                      className="clickable-title"
                      onClick={() => handleItemClick(req)}
                    >
                      {req.titulo}
                    </td>
                    <td>
                      <InteractiveStars 
                        tabId={activeTab} 
                        requirementId={req.id} 
                      />
                    </td>
                    {showDeleteIcons && (
                      <td className="actions-cell">
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
                ))
              ) : (
                <tr>
                  <td colSpan={showDeleteIcons ? 3 : 2} className="no-items">
                    No hay elementos en esta categoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="buttons-container">
          <button 
            className="confirm-button"
            onClick={handleConfirm}
          >
            Confirmar Proyecto
          </button>
          <button 
            className={`delete-button ${showDeleteIcons ? 'cancel' : ''}`}
            onClick={toggleDeleteMode}
          >
            {showDeleteIcons ? "Cancelar" : "Modo Eliminación"}
          </button>
        </div>
      </div>

      {/* Popup de detalles */}
      {showPopup && selectedItem && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>×</button>
            
            <h3 className="popup-title">
              {editing ? (
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleInputChange}
                  className="edit-title-input"
                />
              ) : (
                selectedItem.titulo
              )}
            </h3>
            
            <div className="popup-details">
              <p><strong>ID:</strong> {selectedItem.id}</p>
              
              <div className="description-section">
                <p><strong>Descripción:</strong></p>
                {editing ? (
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    className="edit-textarea"
                    rows="6"
                  />
                ) : (
                  <div className="description-text">{selectedItem.data}</div>
                )}
              </div>
              
              <div className="rating-section">
                <p><strong>Valoración:</strong></p>
                <InteractiveStars 
                  tabId={activeTab} 
                  requirementId={selectedItem.id}
                  interactive={editing}
                />
              </div>
            </div>
            
            <div className="popup-footer">
              {saveStatus.success && (
                <div className="save-success">¡Cambios guardados!</div>
              )}
              {saveStatus.error && (
                <div className="save-error">{saveStatus.error}</div>
              )}
              
              {editing ? (
                <>
                  <button 
                    className="popup-button secondary"
                    onClick={() => {
                      setEditing(false);
                      setSaveStatus({ loading: false, error: null, success: false });
                    }}
                    disabled={saveStatus.loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="popup-button primary"
                    onClick={handleSaveEdit}
                    disabled={saveStatus.loading}
                  >
                    {saveStatus.loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </>
              ) : (
                <button 
                  className="popup-button primary"
                  onClick={handleEditClick}
                >
                  Editar Elemento
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