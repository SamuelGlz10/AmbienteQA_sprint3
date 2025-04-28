import React, { useState } from "react";
import ErrorPopup from "../components/ErrorPopup";

import "../css/Dashboard.css";

const RenderRequirementsTab = ({ ...props }) => {
  const {
    project,
    activeRequirement,
    setActiveRequirement,
    handleItemClick,
    showPopup,
    selectedItem,
    handleClosePopup,
    tasks,
    setTasks,
    teamMembers,
    deleteMode,
    setDeleteMode,
    setTaskToDelete,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    showTaskForm,
    setShowTaskForm,
    taskFormData,
    setTaskFormData,
    setSuccessMessage,
    setShowDeleteConfirmation,
    role,
    editing,
    setEditing,
    saveStatus,
    setSaveStatus,
    editData,
    setEditData,
    handleInputChange,
    handleSaveEdit,
  } = props;

  const requirementTabs = [
    { id: "EP", title: "EP", fullText: "Épicas" },
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
  ];

  // Add error state for task‐form validation
  const [error, setError] = useState("");

  return (
    <div className="requirements-section">
      <div className="requirements-tabs">
        {requirementTabs.map((tab) => (
          <button
            key={tab.id}
            className={`requirement-tab ${
              activeRequirement === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveRequirement(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            <span className="tab-full-text"> - {tab.fullText}</span>
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {project[activeRequirement]?.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="clickable-row"
              >
                <td>{item.id}</td>
                <td>{item.titulo}</td>
                <td>{item.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && selectedItem && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={handleClosePopup}>
              ×
            </button>

            <div className="popup-header">
              <button
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                style={{
                  position: "absolute",
                  left: "20px",
                  top: "20px",
                  backgroundColor: "#f0e6ff",
                  color: "#5d3a7f",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Editar
              </button>

              <h3 className="popup-title">{selectedItem.titulo}</h3>
              <p className="popup-id">
                <strong>ID:</strong> {selectedItem.id}
              </p>
            </div>
            <div className="popup-body">
              <div className="description-section">
                <h4>{!editing ? ("Descripción:"):("")}</h4>
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
                  <div className="description-text">{selectedItem.data}</div>
                )}
              </div>

              {/* Tabla de tareas */}
              <div className="tasks-section">
                <h4>Tareas relacionadas:</h4>
                {tasks[selectedItem.id] && tasks[selectedItem.id].length > 0 ? (
                  <div className="tasks-table-container">
                    <table className="tasks-table">
                      <thead>
                        <tr>
                          <th></th> {/* Columna para el ícono de arrastre */}
                          <th>Título</th>
                          <th>Descripción</th>
                          <th>Prioridad</th>
                          <th>Asignado a</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks[selectedItem.id].map((task, index) => {
                          // Encontrar el miembro del equipo por email
                          const assignedMember = teamMembers.find(
                            (member) => member.email === task.assignee
                          );

                          return (
                            <tr
                              key={task.id}
                              draggable={!deleteMode}
                              onDragStart={
                                !deleteMode
                                  ? (e) => handleDragStart(e, task.id, index)
                                  : null
                              }
                              onDragOver={!deleteMode ? handleDragOver : null}
                              onDragEnter={!deleteMode ? handleDragEnter : null}
                              onDragLeave={!deleteMode ? handleDragLeave : null}
                              onDrop={
                                !deleteMode
                                  ? (e) => handleDrop(e, index, selectedItem.id)
                                  : null
                              }
                              onDragEnd={!deleteMode ? handleDragEnd : null}
                              className={`draggable-task-row ${
                                deleteMode ? "delete-mode" : ""
                              }`}
                            >
                              <td
                                className="drag-handle"
                                style={{
                                  width: "40px",
                                  minWidth: "40px",
                                  maxWidth: "40px",
                                  height: "40px",
                                  textAlign: "center",
                                  cursor: deleteMode ? "pointer" : "grab",
                                  position: "relative",
                                  overflow: "visible",
                                }}
                                onClick={
                                  deleteMode
                                    ? () => {
                                        setTaskToDelete({
                                          id: task.id,
                                          title: task.title,
                                          elementId: selectedItem.id,
                                        });
                                        setShowDeleteConfirmation(true);
                                      }
                                    : undefined
                                }
                                onMouseEnter={
                                  deleteMode
                                    ? (e) => {
                                        const deleteIcon =
                                          e.currentTarget.querySelector(
                                            ".delete-mode-icon"
                                          );
                                        if (deleteIcon) {
                                          deleteIcon.style.transform =
                                            "scale(1.3)";
                                        }
                                      }
                                    : undefined
                                }
                                onMouseLeave={
                                  deleteMode
                                    ? (e) => {
                                        const deleteIcon =
                                          e.currentTarget.querySelector(
                                            ".delete-mode-icon"
                                          );
                                        if (deleteIcon) {
                                          deleteIcon.style.transform =
                                            "scale(1)";
                                        }
                                      }
                                    : undefined
                                }
                              >
                                {!deleteMode ? (
                                  <span className="drag-icon">≡</span>
                                ) : (
                                  <div
                                    style={{
                                      position: "absolute",
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      top: 0,
                                      left: 0,
                                    }}
                                  >
                                    <span
                                      className="delete-mode-icon"
                                      style={{
                                        fontSize: "20px",
                                        transition: "transform 0.15s ease",
                                      }}
                                    >
                                      ×
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td>{task.title}</td>
                              <td>{task.description}</td>
                              <td>
                                <span
                                  className={`priority-badge ${task.priority}`}
                                >
                                  {task.priority.charAt(0).toUpperCase() +
                                    task.priority.slice(1)}
                                </span>
                              </td>
                              <td>
                                {assignedMember
                                  ? assignedMember.name
                                  : "No asignado"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-tasks-message">
                    No hay tareas registradas para este elemento.
                  </p>
                )}
              </div>
            </div>

            {/* Simplificar la sección del popup-footer eliminando el mensaje de instrucciones */}
            {!showTaskForm ? (
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
                  <div className="popup-footer-buttons">
                    {/* Mostrar botón de Nueva Tarea solo cuando NO estamos en modo eliminación */}
                    {!deleteMode && (role === "admin" || role === "editor") && (
                      <button
                        className="edit-team-button"
                        style={{
                          position: "static",
                          transform: "none",
                          margin: "5px 0",
                          left: "auto",
                          maxWidth: "200px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTaskForm(true);
                        }}
                      >
                        Nueva Tarea
                      </button>
                    )}

                    {/* Mostrar botón de eliminar solo si hay tareas */}
                    {tasks[selectedItem.id] &&
                      tasks[selectedItem.id].length > 0 && (
                        <button
                          className="delete-team-button"
                          style={{
                            position: "static",
                            transform: "none",
                            margin: "5px 0",
                            left: "auto",
                            width: "180px",
                            backgroundColor: deleteMode ? "#e0e0e0" : "#ff6b6b",
                            color: deleteMode ? "#333" : "white",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteMode(!deleteMode);
                          }}
                        >
                          {deleteMode ? "Cancelar" : "Eliminar Tarea"}
                        </button>
                      )}
                  </div>
                )}
              </div>
            ) : (
              <div className="task-form-container">
                <div className="task-form" style={{ width: "100%", marginLeft: "-15px", marginRight: "-15px", padding: "20px", }}>
                  <h4>Crear Nueva Tarea</h4>

                  <div className="form-group">
                    <label>Título:</label>
                    <input
                      type="text"
                      value={taskFormData.title}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Título de la tarea"
                    />
                  </div>
                  <div className="form-group">
                    <label>Descripción:</label>
                    <textarea
                      value={taskFormData.description}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción de la tarea"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prioridad:</label>
                    <select
                      value={taskFormData.priority}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar prioridad</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Asignar a:</label>
                    <select
                      value={taskFormData.assignee}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          assignee: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccionar miembro</option>
                      {teamMembers.map((member) => (
                        <option key={member.email} value={member.email}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="task-form-actions">
                    <button
                      className="cancel-button"
                      onClick={() => {
                        setShowTaskForm(false);
                        setTaskFormData({ title: "", description: "", priority: "", assignee: "" });
                        setError("");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="save-button"
                      onClick={() => {
                        // Array para recolectar mensajes de error
                        const missingFields = [];

                        // Validar todos los campos requeridos
                        if (!taskFormData.title.trim()) {
                          missingFields.push("título");
                        }
                        if (!taskFormData.description.trim()) {
                          missingFields.push("descripción");
                        }
                        if (!taskFormData.priority) {
                          missingFields.push("prioridad");
                        }
                        if (!taskFormData.assignee) {
                          missingFields.push("asignación a un miembro");
                        }

                        // Si hay campos faltantes, mostrar error
                        if (missingFields.length > 0) {
                          if (missingFields.length === 1) {
                            setError(
                              `Debe completar el campo de ${missingFields[0]}.`
                            );
                          } else {
                            const last = missingFields.pop();
                            setError(
                              `Debe completar los campos de ${missingFields.join(
                                ", "
                              )} y ${last}.`
                            );
                          }
                          return;
                        }

                        // Si pasa la validación, crear objeto de tarea
                        const newTask = {
                          id: Date.now(),
                          title: taskFormData.title,
                          description: taskFormData.description,
                          priority: taskFormData.priority,
                          assignee: taskFormData.assignee,
                        };

                        // update local state
                        const currentTasks = tasks[selectedItem.id] || [];
                        const updatedTasks = [...currentTasks, newTask];
                        setTasks(prev => ({
                          ...prev,
                          [selectedItem.id]: updatedTasks,
                        }));

                        // build payload for Firestore
                        const payload = {
                          requirementType: activeRequirement,
                          elementId: selectedItem.id,
                          tasks: updatedTasks.map(task => ({
                            id: task.id.toString(),
                            titulo: task.title,
                            descripcion: task.description,
                            prioridad: task.priority,
                            asignados:
                              teamMembers.find(m => m.email === task.assignee)?.id || null,
                            estado: "En progreso",
                          })),
                        };

                        // persist to Firebase via new endpoint
                        fetch(
                          `http://localhost:5001/projectsFB/${project.id}/tasks`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify(payload),
                          }
                        ).catch(console.error);

                        setSuccessMessage("Tarea creada exitosamente.");
                        setError("");
                        setShowTaskForm(false);
                        setTaskFormData({ title: "", description: "", priority: "", assignee: "" });
                      }}
                    >
                      Crear Tarea
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* show validation errors in popup */}
      {error && (
        <ErrorPopup
          message={error}
          onClose={() => setError("")}
        />
      )}
    </div>
  );
};

export default RenderRequirementsTab;
