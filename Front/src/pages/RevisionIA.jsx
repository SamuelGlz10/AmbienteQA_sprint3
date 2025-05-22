import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/RevisionIA.css";
import "../css/DragAndDropTable.css";
import DragAndDropTable from "../components/DragAndDropTable";
import TopAppBar from "../components/TopAppBar";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el popup de éxito
import ConfirmationPopup from "../components/ConfirmationPopup";

function RevisionIA() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("RNF");
  const [expandedTab, setExpandedTab] = useState(null);
  const [showDeleteIcons, setShowDeleteIcons] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: "", description: "" });

  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });
  const [editingProject, setEditingProject] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null); // Estado para Drag-and-Drop
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Estado para confirmar eliminación
  const [deleteAction, setDeleteAction] = useState(null); // Acción de eliminación (RF, RNF, HU, EP)
  const [editTasksData, setEditTasksData] = useState([]); // Estado para editar tareas

  const tabs = [
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
    { id: "EP", title: "EP", fullText: "Epicas" },
  ];

  const transformGeneratedData = (data) => {
    const parseSection = (section) => {
      if (!section) return [];

      return Array.isArray(section)
        ? section.map((item) => ({
            id: item.id,
            titulo: item.titulo,
            data: item.data,

            tasks: Array.isArray(item.tasks) ? item.tasks : [], // <-- preservar o inicializar
          }))
        : [];
    };

    return {
      nombreProyecto:
        data.projectName || data.nombreProyecto || "Proyecto sin nombre",
      descripcion: data.description || data.descripcion || "Sin descripción",
      estatus: data.estatus || "Abierto",
      fechaCreacion:
        data.fechaCreacion || new Date().toISOString().split("T")[0],
      sprintNumber: data.sprintNumber || 0,
      EP: parseSection(data.EP || data.epics),
      RF: parseSection(data.RF || data.functionalRequirements),
      RNF: parseSection(data.RNF || data.nonFunctionalRequirements),
      HU: parseSection(data.HU || data.userStories),
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
      const draggedIndex = updatedTab.findIndex(
        (item) => item.id === draggedItem.id
      );
      const targetIndex = updatedTab.findIndex(
        (item) => item.id === targetItem.id
      );

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

        const sessionData = sessionStorage.getItem("projectData");

        if (sessionData) {
          setProjectData(JSON.parse(sessionData));
        } else if (location.state?.generatedText) {
          let jsonData = location.state.generatedText
            .replace(/```json|```/g, "")
            .replace(/'/g, '"')
            .trim();

          const parsedData = JSON.parse(jsonData);
          const transformedData = transformGeneratedData(parsedData);
          console.log("Datos transformados:", transformedData);

          setProjectData(transformedData);

          sessionStorage.setItem(
            "projectData",
            JSON.stringify(transformedData)
          );
        } else {
          throw new Error("No se recibieron datos del proyecto");
        }
      } catch (err) {
        setError(`Error al procesar los datos: ${err.message}`);

        const fallbackData = {
          nombreProyecto: "Proyecto de Ejemplo",
          descripcion:
            "Datos de ejemplo cargados por error en los datos originales",
          estatus: "Abierto",
          fechaCreacion: new Date().toISOString().split("T")[0],
          sprints: 3,
          EP: [
            {
              id: "EP01",
              titulo: "Ejemplo Épica",
              data: "Descripción de épica de ejemplo",
            },
          ],
          RF: [
            {
              id: "RF01",
              titulo: "Ejemplo RF",
              data: "Descripción de requerimiento funcional",
            },
          ],
          RNF: [
            {
              id: "RNF01",
              titulo: "Ejemplo RNF",
              data: "Descripción de requerimiento no funcional",
            },
          ],
          HU: [
            {
              id: "HU01",
              titulo: "Ejemplo HU",
              data: "Como usuario quiero...",
              tasks: [
                {
                  id: "task1",
                  titulo: "Tarea 1",
                  descripcion: "Descripción",
                  asignado: NULL,
                  estado: "En progreso",
                  prioridad: "Alta",
                  sprint: 1,
                },
              ],
            },
          ],
        };

        setProjectData(fallbackData);
        sessionStorage.setItem("projectData", JSON.stringify(fallbackData));
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const handleBeforeUnload = (e) => {
      if (e.currentTarget.performance?.navigation?.type === 1) {
        return;
      }

      sessionStorage.setItem("isNavigatingAway", "true");
    };

    const handlePopState = () => {
      sessionStorage.removeItem("projectData");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.state]);

  const toggleExpand = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  const handleDeleteItem = (tabId, id) => {
    setDeleteAction({ tabId, id });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteAction || !projectData) return;

    const { tabId, id } = deleteAction;

    setProjectData((prev) => {
      const updatedData = {
        ...prev,
        [tabId]: prev[tabId].filter((req) => req.id !== id),
      };
      sessionStorage.setItem("projectData", JSON.stringify(updatedData));
      return updatedData;
    });

    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setEditData({
      title: item.titulo,
      description: item.data,
    });
    setEditTasksData(item.tasks || []); // Cargar tareas
    setShowPopup(true);
    setEditing(false);
    setSaveStatus({ loading: false, error: null, success: false });
  };

  const handleTaskChange = (index, field, value) => {
    setEditTasksData((prev) => {
      const arr = [...prev];
      const t = { ...arr[index] };
      if (field === "id") {
        t.id = value;
      } else if (field === "title") {
        t.title = value;
        t.titulo = value;
      } else if (field === "description") {
        t.descripcion = value;
        delete t.data;
        delete t.description;
      } else if (field === "priority") {
        t.priority = value;
        t.prioridad = value;
      }
      arr[index] = t;
      return arr;
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !projectData) return;

    try {
      setSaveStatus({ loading: true, error: null, success: false });

      await new Promise((resolve) => setTimeout(resolve, 800)); // Simula un retraso

      setProjectData((prev) => {
        const updatedTab = [...prev[activeTab]];
        const itemIndex = updatedTab.findIndex(
          (item) => item.id === selectedItem.id
        );
        if (itemIndex !== -1) {
          updatedTab[itemIndex] = {
            ...updatedTab[itemIndex],
            titulo: editData.title,
            data: editData.description,
            tasks: editTasksData, // Guardar tareas editadas
          };
        }

        const updatedData = {
          ...prev,
          [activeTab]: updatedTab,
        };

        sessionStorage.setItem("projectData", JSON.stringify(updatedData));

        return updatedData;
      });

      setSelectedItem((prev) => ({
        ...prev,
        titulo: editData.title,
        data: editData.description,
        tasks: editTasksData, // Actualizar selectedItem
      }));

      setSaveStatus({ loading: false, error: null, success: true });

      // Mostrar el SuccessPopup y cerrar el popup de edición
      setShowPopup(false); // Cierra el popup de edición
      setSuccessMessage("¡Cambios guardados exitosamente!"); // Muestra el popup de éxito
    } catch (error) {
      setSaveStatus({
        loading: false,
        error: "Error al guardar",
        success: false,
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (selectedItem) {
      setEditData({
        title: selectedItem.titulo,
        description: selectedItem.data,
      });
      setEditTasksData(selectedItem.tasks || []);
    }
    setSaveStatus({ loading: false, error: null, success: false });
  };

  const handleConfirm = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("No se encontró el ID de usuario en el almacenamiento local."); // Muestra el popup de error
        return;
      }

      // Hacer Post al proyecto
      const response = await fetch(`${BACKEND_URL}/projectsFB/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          `Error al guardar el proyecto: ${
            errorData.message || "Error desconocido"
          }`
        ); // Muestra el popup de error
        return;
      }

      const projectResponse = await response.json();
      const projectId = projectResponse.id;

      // Linkear el proyecto al usuario
      const linkResponse = await fetch(
        `${BACKEND_URL}/projectsFB/linkUserToProject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: userId,
            projectId: projectId,
          }),
        }
      );

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        setError(
          `Error al vincular el proyecto al usuario: ${
            errorData.message || "Error desconocido"
          }`
        ); // Muestra el popup de error
        return;
      }

      setSuccessMessage("Proyecto guardado exitosamente."); // Muestra el popup de éxito
      sessionStorage.removeItem("projectData");
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      setError("Error al guardar el proyecto. Por favor, inténtalo de nuevo."); // Muestra el popup de error
    }
  };

  const closeErrorPopup = () => {
    setError(null); // Cierra el popup de error
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null); // Cierra el popup de éxito
    navigate("/home");
  };

  const handleSaveProjectChanges = async () => {
    try {
      setSaveStatus({ loading: true, error: null, success: false });

      await new Promise((resolve) => setTimeout(resolve, 800)); // Simula un retraso

      setProjectData((prev) => {
        const updatedData = {
          ...prev,
          nombreProyecto: projectData.nombreProyecto,
          descripcion: projectData.descripcion,
        };

        console.log(
          "JSON actualizado automáticamente:",
          JSON.stringify(updatedData, null, 2)
        );

        sessionStorage.setItem("projectData", JSON.stringify(updatedData));

        return updatedData;
      });

      setSaveStatus({ loading: false, error: null, success: true });

      // Mostrar el SuccessPopup
      setSuccessMessage("¡Cambios guardados exitosamente!"); // Muestra el popup de éxito

      // Desactivar el modo de edición inmediatamente
      setEditingProject(false);
    } catch (error) {
      setSaveStatus({
        loading: false,
        error: "Error al guardar",
        success: false,
      });
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
    setShowBackConfirm(true);
  };

  const confirmBack = () => {
    sessionStorage.removeItem("projectData");
    setShowBackConfirm(false);
    navigate("/generate");
  };

  const cancelBack = () => {
    setShowBackConfirm(false);
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
    <div className="white-container">
      <TopAppBar />
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
            <label htmlFor="project-name" className="label-title">
              Nombre del Proyecto:
            </label>
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
            <label htmlFor="project-description" className="label-title">
              Descripción:
            </label>
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
            onClick={
              editingProject
                ? handleSaveProjectChanges
                : () => setEditingProject(true)
            }
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
          <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />
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
                  {activeTab === "RF"
                    ? "Requerimientos funcionales"
                    : activeTab === "RNF"
                    ? "Requerimientos no funcionales"
                    : activeTab === "HU"
                    ? "Historias de usuario"
                    : "Epicas"}
                </th>
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
                    {showDeleteIcons && (
                      <td className="actions-cell">
                        <button
                          className="delete-icon"
                          onClick={() => handleDeleteItem(activeTab, item.id)}
                          aria-label="Eliminar"
                        >
                          X
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showDeleteIcons ? 2 : 1} className="no-items">
                    No hay elementos en esta categoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="buttons-container">
          <button className="confirm-button" onClick={handleConfirm}>
            Confirmar
          </button>
          <button
            className={`delete-button ${showDeleteIcons ? "cancel" : ""}`}
            onClick={() => setShowDeleteIcons(!showDeleteIcons)}
          >
            {showDeleteIcons ? "Cancelar" : "Modo Eliminación"}
          </button>
        </div>
      </div>

      {showPopup && selectedItem && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              ×
            </button>

            <div className="popup-header">
              <h3 className="popup-title">{selectedItem.titulo}</h3>
              <p className="popup-id">
                <strong>ID:</strong> {selectedItem.id}
              </p>
            </div>

            <div className="popup-body">
              <div className="description-section">
                <h4>Descripción:</h4>
                {editing ? (
                  <>
                    <label htmlFor="title-input" className="label-title">
                      Título:
                    </label>
                    <input
                      id="title-input"
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                    <label htmlFor="description-input" className="label-title">
                      Descripción:
                    </label>
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
                    {selectedItem.data ||
                      selectedItem.description ||
                      selectedItem.descripcion}
                  </div>
                )}
              </div>

              {activeTab === "HU" && (
                <div className="tasks-section">
                  <h4 className="label-title">
                    <b>Tareas relacionadas:</b>
                  </h4>
                  {editTasksData.length > 0 ? (
                    <div className="tasks-table-container">
                      <table className="tasks-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Prioridad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editTasksData.map((task, i) => (
                            <tr key={i}>
                              <td>{task.id}</td>
                              <td>
                                {editing ? (
                                  <textarea
                                    value={task.titulo || task.title}
                                    onChange={(e) =>
                                      handleTaskChange(
                                        i,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    className="edit-textarea"
                                    rows={2} // Adjust rows as needed for better visibility
                                  />
                                ) : (
                                  task.titulo || task.title
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <textarea
                                    value={task.descripcion || task.data}
                                    onChange={(e) =>
                                      handleTaskChange(
                                        i,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="edit-textarea"
                                    rows={2}
                                  />
                                ) : (
                                  task.descripcion || task.data
                                )}
                              </td>
                              <td>
                                {editing ? (
                                  <select
                                    value={
                                      task.prioridad || task.priority || ""
                                    }
                                    onChange={(e) =>
                                      handleTaskChange(
                                        i,
                                        "priority",
                                        e.target.value
                                      )
                                    }
                                    className="assignee-dropdown-button"
                                  >
                                    <option value="alta">Alta</option>
                                    <option value="media">Media</option>
                                    <option value="baja">Baja</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`priority-badge ${
                                      task.prioridad || task.priority
                                    }`}
                                  >
                                    {(task.prioridad || task.priority || "")
                                      .charAt(0)
                                      .toUpperCase() +
                                      (
                                        task.prioridad ||
                                        task.priority ||
                                        ""
                                      ).slice(1)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-tasks-message">
                      No hay tareas registradas para este elemento.
                    </p>
                  )}
                </div>
              )}
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
                    onClick={handleCancelEdit}
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

      {/* Confirmacion para navegar */}
      <ConfirmationPopup
        isVisible={showBackConfirm}
        onClose={cancelBack}
        onConfirm={confirmBack}
        canUndo={true}
        title="¿Estás seguro que quieres volver?"
        message="Si vuelves, se borrarán los datos actuales del proyecto."
        confirmText="Sí, volver"
        cancelText="Cancelar"
      />

      {/* Confirmacion para borrar */}
      <ConfirmationPopup
        isVisible={showDeleteConfirm}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="¿Estás seguro que quieres eliminar este elemento?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Popup de error */}
      <ErrorPopup message={error} onClose={closeErrorPopup} />

      {/* Popup de éxito */}
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />
    </div>
  );
}

export default RevisionIA;
