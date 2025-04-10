import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/RevisionIA.css";
import "../css/DragAndDropTable.css";
import DragAndDropTable from "../components/DragAndDropTable";

function RevisionIA() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);
  const [ratings, setRatings] = useState({ RF: {}, RNF: {}, HU: {}, EP: {} });
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [saveStatus, setSaveStatus] = useState({ 
    loading: false, 
    error: null, 
    success: false 
  });
  const [editingProject, setEditingProject] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null); // Estado para Drag-and-Drop

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
    { id: "EP", title: "EP", fullText: "Epicas" }
  ];

  const transformGeneratedData = (data) => {
    const parseSection = (section, prefix) => {
      if (!section) return [];
      
      if (Array.isArray(section)) {
        return section.map((item, i) => ({
          id: item.id || `${prefix}${(i + 1).toString().padStart(2, '0')}`,
          titulo: item.title || item.titulo || `${prefix} ${i + 1}`,
          data: item.data || item.descripcion || "Sin descripción"
        }));
      }
      
      if (typeof section === 'object') {
        return Object.entries(section).map(([titulo, data], i) => ({
          id: `${prefix}${(i + 1).toString().padStart(2, '0')}`,
          titulo,
          data: data || "Sin descripción"
        }));
      }
      
      return [];
    };

    return {
      nombreProyecto: data.projectName || data.nombreProyecto || "Proyecto sin nombre",
      descripcion: data.description || data.descripcion || "Sin descripción",
      estatus: data.estatus || "Abierto",
      fechaCreacion: data.fechaCreacion || new Date().toISOString().split('T')[0],
      EP: parseSection(data.epics || data.EP, "EP"),
      RF: parseSection(data.functionalRequirements || data.RF, "RF"),
      RNF: parseSection(data.nonFunctionalRequirements || data.RNF, "RNF"),
      HU: parseSection(data.userStories || data.HU, "HU")
    };
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const saveOrderToBackend = (updatedTab) => {
    console.log("Orden actualizado localmente:", {
      tabId: activeTab,
      requirements: updatedTab,
    });
  
    // Actualizar el estado local
    setProjectData((prev) => ({
      ...prev,
      [activeTab]: updatedTab,
    }));
  };
  
  const handleDrop = (targetItem) => {
    if (!draggedItem || !projectData) return;
  
    setProjectData((prev) => {
      const updatedTab = [...prev[activeTab]];
      const draggedIndex = updatedTab.findIndex((item) => item.id === draggedItem.id);
      const targetIndex = updatedTab.findIndex((item) => item.id === targetItem.id);
  
      // Reorganizar los elementos
      updatedTab.splice(draggedIndex, 1);
      updatedTab.splice(targetIndex, 0, draggedItem);
  
      // Guardar el nuevo orden en el backend
      saveOrderToBackend(updatedTab);
  
      return {
        ...prev,
        [activeTab]: updatedTab,
      };
    });
  
    setDraggedItem(null);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const sessionData = sessionStorage.getItem('projectData');
        
        if (sessionData) {
          setProjectData(JSON.parse(sessionData));
          
          const sessionRatings = sessionStorage.getItem('projectRatings');
          if (sessionRatings) {
            setRatings(JSON.parse(sessionRatings));
          }
        } 
        else if (location.state?.generatedText) {
          let jsonData = location.state.generatedText
            .replace(/```json|```/g, '')
            .replace(/'/g, '"')
            .trim();

          const parsedData = JSON.parse(jsonData);
          const transformedData = transformGeneratedData(parsedData);

          setProjectData(transformedData);
          
          sessionStorage.setItem('projectData', JSON.stringify(transformedData));
        } else {
          throw new Error("No se recibieron datos del proyecto");
        }
      } catch (err) {
        setError(`Error al procesar los datos: ${err.message}`);
        
        const fallbackData = {
          nombreProyecto: "Proyecto de Ejemplo",
          descripcion: "Datos de ejemplo cargados por error en los datos originales",
          estatus: "Abierto",
          fechaCreacion: new Date().toISOString().split('T')[0],
          EP: [{ id: "EP01", titulo: "Ejemplo Épica", data: "Descripción de épica de ejemplo" }],
          RF: [{ id: "RF01", titulo: "Ejemplo RF", data: "Descripción de requerimiento funcional" }],
          RNF: [{ id: "RNF01", titulo: "Ejemplo RNF", data: "Descripción de requerimiento no funcional" }],
          HU: [{ id: "HU01", titulo: "Ejemplo HU", data: "Como usuario quiero..." }]
        };
        
        setProjectData(fallbackData);
        sessionStorage.setItem('projectData', JSON.stringify(fallbackData));
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleBeforeUnload = (e) => {
      if (e.currentTarget.performance?.navigation?.type === 1) {
        return;
      }
      
      sessionStorage.setItem('isNavigatingAway', 'true');
    };

    const handlePopState = () => {
      sessionStorage.removeItem('projectData');
      sessionStorage.removeItem('projectRatings');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.state]);

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  const InteractiveStars = ({ tabId, requirementId }) => {
    const currentRating = ratings[tabId]?.[requirementId] || 0;
    
    const handleStarClick = (selectedRating) => {
      setRatings(prev => {
        const newRatings = {
          ...prev,
          [tabId]: {
            ...prev[tabId],
            [requirementId]: selectedRating
          }
        };
        
        sessionStorage.setItem('projectRatings', JSON.stringify(newRatings));
        
        return newRatings;
      });
    };

    return (
      <div className="stars-container interactive">
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
    
    setProjectData(prev => {
      const updatedData = {
        ...prev,
        [tabId]: prev[tabId].filter(req => req.id !== id)
      };
      sessionStorage.setItem('projectData', JSON.stringify(updatedData));
      return updatedData;
    });
    
    setRatings(prev => {
      const newRatings = {...prev};
      if (newRatings[tabId]?.[id]) {
        delete newRatings[tabId][id];
      }
      sessionStorage.setItem('projectRatings', JSON.stringify(newRatings));
      return newRatings;
    });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setEditData({
      title: item.titulo,
      description: item.data
    });
    setShowPopup(true);
    setEditing(false);
    setSaveStatus({ loading: false, error: null, success: false });
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !projectData) return;

    try {
        setSaveStatus({ loading: true, error: null, success: false });

        await new Promise((resolve) => setTimeout(resolve, 800));

        setProjectData((prev) => {
            const updatedTab = [...prev[activeTab]];
            const itemIndex = updatedTab.findIndex((item) => item.id === selectedItem.id);
            if (itemIndex !== -1) {
                updatedTab[itemIndex] = {
                    ...updatedTab[itemIndex],
                    titulo: editData.title,
                    data: editData.description,
                };
            }

            const updatedData = {
                ...prev,
                [activeTab]: updatedTab,
            };
            
            sessionStorage.setItem('projectData', JSON.stringify(updatedData));
          
            return updatedData;
        });

        setSelectedItem((prev) => ({
            ...prev,
            titulo: editData.title,
            data: editData.description,
        }));

        setSaveStatus({ loading: false, error: null, success: true });

        

        setTimeout(() => {
            setShowPopup(false);
            setEditing(false);
        }, 1000);
    } catch (error) {
        setSaveStatus({ loading: false, error: "Error al guardar", success: false });
    }
};

  const handleConfirm = async () => {
    try {

      const userId = localStorage.getItem("UserID");

      if (!userId) {
        alert("No se encontró el ID de usuario en el almacenamiento local.");
        return;
      }

      // Hacer Post al proyecto
      const response = await fetch("http://localhost:5001/projectsFB/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error al guardar el proyecto: ${errorData.message || "Error desconocido"}`);
        return;
      }

      const projectResponse = await response.json();
      const projectId = projectResponse.id;

      // Linkear el proyecto al usuario
      const linkResponse = await fetch("http://localhost:5001/projectsFB/linkUserToProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          projectId: projectId,
        }),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        alert(`Error al vincular el proyecto al usuario: ${errorData.message || "Error desconocido"}`);
        return;
      }

      alert("Proyecto guardado exitosamente.");
      sessionStorage.removeItem('projectData');
      sessionStorage.removeItem('projectRatings');
      navigate("/home"); // Redirigir a la página de inicio después de guardar

    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      alert("Error al guardar el proyecto. Por favor, inténtalo de nuevo.");
    }
    
  };

  const handleSaveProjectChanges = async () => {
    try {
        setSaveStatus({ loading: true, error: null, success: false });

        await new Promise((resolve) => setTimeout(resolve, 800));

        setSaveStatus({ loading: false, error: null, success: true });

        setProjectData((prev) => {
            const updatedData = {
                ...prev,
                nombreProyecto: projectData.nombreProyecto,
                descripcion: projectData.descripcion,
            };

            console.log("JSON actualizado automáticamente:", JSON.stringify(updatedData, null, 2));
            
            sessionStorage.setItem('projectData', JSON.stringify(updatedData));
            
            return updatedData;
        });

        setTimeout(() => {
            setSaveStatus({ loading: false, error: null, success: false });
            setEditingProject(false);
        }, 2000);
    } catch (error) {
        setSaveStatus({ loading: false, error: "Error al guardar", success: false });
    }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBackToGenerate = () => {
    // Limpiar sessionStorage
    sessionStorage.removeItem('projectData');
    sessionStorage.removeItem('projectRatings');
    
    // Navegar a la página de Generate
    navigate("/generate");
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

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h3>{error}</h3>
          <p>Se cargaron datos de ejemplo para continuar.</p>
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
        {/* Botón de volver a generate */}
        <button 
          className="back-to-generate-button"
          onClick={handleBackToGenerate}
          aria-label="Volver a Generate"
        >
          ←
        </button>
        
        {editingProject ? (
          <>
            <label htmlFor="project-name" className="label-title">Nombre del Proyecto:</label>
            <input
              id="project-name"
              type="text"
              name="nombreProyecto"
              value={projectData.nombreProyecto}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  nombreProyecto: e.target.value,
                }))
              }
              className="edit-input"
            />
            <label htmlFor="project-description" className="label-title">Descripción:</label>
            <textarea
              id="project-description"
              name="descripcion"
              value={projectData.descripcion}
              onChange={(e) =>
                setProjectData((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="edit-textarea"
              rows="4"
            />
          </>
        ) : (
          <>
            <h2>Revisión de datos - {projectData.nombreProyecto}</h2>
            <p className="project-description">{projectData.descripcion}</p>
          </>
        )}
        <div className="center-button-container">
          <button
            className="edit-project-button"
            onClick={editingProject ? handleSaveProjectChanges : () => setEditingProject(true)}
            disabled={saveStatus.loading}
          >
            {editingProject
              ? saveStatus.loading
                ? "Guardando..."
                : "Guardar Cambios"
              : "Editar Proyecto"}
          </button>
        </div>
        {saveStatus.success && (
          <div className="save-success">¡Cambios guardados!</div>
        )}
        {saveStatus.error && (
          <div className="save-error">{saveStatus.error}</div>
        )}
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
                projectData[activeTab].map((item) => (
                  <tr
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onDragOver={(e) => e.preventDefault()} // Permitir el drop
                    onDrop={() => handleDrop(item)}
                  >
                    <td 
                      className="clickable-title"
                      onClick={() => handleItemClick(item)}
                    >
                      {item.titulo}
                    </td>
                    <td>
                      <InteractiveStars 
                        tabId={activeTab} 
                        requirementId={item.id} 
                      />
                    </td>
                    {showDeleteIcons && (
                      <td className="actions-cell">
                        <button 
                          className="delete-icon" 
                          onClick={() => handleDeleteItem(activeTab, item.id)}
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
            Confirmar
          </button>
          <button 
            className={`delete-button ${showDeleteIcons ? 'cancel' : ''}`}
            onClick={() => setShowDeleteIcons(!showDeleteIcons)}
          >
            {showDeleteIcons ? "Cancelar" : "Modo Eliminación"}
          </button>
        </div>
      </div>

      {showPopup && selectedItem && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>×</button>
            
            <div className="popup-header">
              <h3 className="popup-title">{selectedItem.titulo}</h3>
              <p className="popup-id"><strong>ID:</strong> {selectedItem.id}</p>
            </div>
            
            <div className="popup-body">
              <div className="description-section">
                <h4>Descripción:</h4>
                {editing ? (
                  <>
                    <label htmlFor="title-input" className="label-title">Título:</label>
                    <input
                      id="title-input"
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                    <label htmlFor="description-input" className="label-title">Descripción:</label>
                    <textarea
                      id="description-input"
                      name="description"
                      value={editData.description}
                      onChange={handleInputChange}
                      className="edit-textarea"
                      rows="8"
                    />
                  </>
                ) : (
                  <div className="description-text">
                    {selectedItem.data}
                  </div>
                )}
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
                    onClick={() => setEditing(false)}
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
                  onClick={() => setEditing(true)}
                >
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
