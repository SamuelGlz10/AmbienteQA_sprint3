import React, { useState, useEffect } from "react";
import ErrorPopup from "./ErrorPopup";

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
    requirementEditData,
    handleInputChange,
    handleSaveEdit,
    nextTaskNumber,
    setNextTaskNumber,
  } = props;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend

  const requirementTabs = [
    { id: "EP", title: "EP", fullText: "Épicas" },
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
  ];

  const [error, setError] = useState("");
  const [editingTasks, setEditingTasks] = useState(false);
  const [originalTasks, setOriginalTasks] = useState([]);

  useEffect(() => {
    if (showPopup && selectedItem) {
      setEditingTasks(false);
    }
  }, [showPopup, selectedItem]);

  const handleStartEditTasks = () => {
    const current = tasks[selectedItem.id] || [];
    setOriginalTasks([...current]);
    setEditingTasks(true);
  };

  const getNextTaskId = () => {
    const allTasks = Object.values(tasks).flat();
    const nums = allTasks
      .map((t) => parseInt(t.id.replace(/^T/, ""), 10))
      .filter((n) => !isNaN(n));
    nums.push(nextTaskNumber);
    const max = nums.length ? Math.max(...nums) : 0;
    return `T${(max + 1).toString().padStart(2, "0")}`;
  };

  const handleAssignee = async (taskId, assigneeEmail) => {
    const member = teamMembers.find((m) => m.email === assigneeEmail);
    const updated = (tasks[selectedItem.id] || []).map((t) =>
      t.id === taskId ? { ...t, assignee: assigneeEmail } : t
    );
    setTasks((prev) => ({ ...prev, [selectedItem.id]: updated }));

    const payload = {
      requirementType: activeRequirement,
      elementId: selectedItem.id,
      tasks: updated.map((t) => ({
        id: t.id.startsWith("T") ? t.id.slice(1) : t.id,
        titulo: t.title,
        descripcion: t.description,
        prioridad: t.priority,
        asignados: teamMembers.find((m) => m.email === t.assignee)?.id || null,
      })),
    };
    try {
      await fetch(`${BACKEND_URL}/projectsFB/${project.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(err);
      setError("Error al asignar la tarea.");
    }
  };

  const handleTaskEditChange = (taskId, field, value) => {
    const updated = (tasks[selectedItem.id] || []).map((t) =>
      t.id === taskId ? { ...t, [field]: value } : t
    );
    setTasks((prev) => ({ ...prev, [selectedItem.id]: updated }));
  };

  const handleSaveTasks = async () => {
    try {
      const payload = {
        requirementType: activeRequirement,
        elementId: selectedItem.id,
        tasks: (tasks[selectedItem.id] || []).map((t) => ({
          id: t.id.replace(/^T/, ""),
          titulo: t.title,
          descripcion: t.description,
          prioridad: t.priority,
          asignados:
            teamMembers.find((m) => m.email === t.assignee)?.id || null,
        })),
      };
      await fetch(`${BACKEND_URL}/projectsFB/${project.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      setEditingTasks(false);
      setSuccessMessage("Tareas actualizadas exitosamente.");
    } catch {
      setError("Error al guardar las tareas.");
    }
  };

  const handleCancelEditTasks = () => {
    setTasks((prev) => ({ ...prev, [selectedItem.id]: originalTasks }));
    setEditingTasks(false);
  };

  const createTask = async () => {
    const missingFields = [];

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

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        setError(`Debe completar el campo de ${missingFields[0]}.`);
      } else {
        const last = missingFields.pop();
        setError(
          `Debe completar los campos de ${missingFields.join(", ")} y ${last}.`
        );
      }
      return;
    }

    const newTask = {
      id: getNextTaskId(),
      title: taskFormData.title,
      description: taskFormData.description,
      priority: taskFormData.priority,
      assignee: taskFormData.assignee,
    };

    const currentTasks = tasks[selectedItem.id] || [];
    const updatedTasks = [...currentTasks, newTask];
    setTasks((prev) => ({
      ...prev,
      [selectedItem.id]: updatedTasks,
    }));

    const payload = {
      requirementType: activeRequirement,
      elementId: selectedItem.id,
      tasks: updatedTasks.map((task) => ({
        id: task.id.startsWith("T") ? task.id.slice(1) : task.id,
        titulo: task.title,
        descripcion: task.description,
        prioridad: task.priority,
        asignados:
          teamMembers.find((m) => m.email === task.assignee)?.id || null,
        estado: "En progreso",
      })),
    };

    fetch(`${BACKEND_URL}/projectsFB/${project.id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    }).catch(console.error);

    setNextTaskNumber((n) => n + 1);
    setSuccessMessage("Tarea creada exitosamente.");
    setError("");
    setShowTaskForm(false);
    setTaskFormData({
      title: "",
      description: "",
      priority: "",
      assignee: "",
    });
  };

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
                <h4>{!editing ? "Descripción:" : ""}</h4>
                {editing ? (
                  <>
                    <label htmlFor="title-input" className="label-title">
                      Título:
                    </label>
                    <input
                      id="title-input"
                      type="text"
                      name="title"
                      value={requirementEditData.title}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                    <label htmlFor="description-input" className="label-title">
                      Descripción:
                    </label>
                    <textarea
                      id="description-input"
                      name="description"
                      value={requirementEditData.description}
                      onChange={handleInputChange}
                      className="edit-textarea"
                      rows="8"
                    />
                  </>
                ) : (
                  <div className="description-text">{selectedItem.data}</div>
                )}
              </div>

              {activeRequirement === "HU" && (
                <div className="tasks-section">
                  <h4>Tareas relacionadas:</h4>
                  {tasks[selectedItem.id] && tasks[selectedItem.id].length > 0 ? (
                    <div className="tasks-table-container">
                      <table className="tasks-table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Prioridad</th>
                            <th>Asignado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks[selectedItem.id].map((task, index) => {
                            if (!task) return null;
                            const assignedMember = teamMembers.find(
                              (member) => member.email === task.assignee
                            );

                            return (
                              <tr
                                style={{ cursor: editingTasks ? "default" : undefined }}
                                key={task.id}
                                draggable={!deleteMode && !editingTasks}
                                onDragStart={
                                  !deleteMode && !editingTasks
                                    ? (e) => handleDragStart(e, task.id, index)
                                    : null
                                }
                                onDragOver={
                                  !deleteMode && !editingTasks
                                    ? handleDragOver
                                    : null
                                }
                                onDragEnter={
                                  !deleteMode && !editingTasks
                                    ? handleDragEnter
                                    : null
                                }
                                onDragLeave={
                                  !deleteMode && !editingTasks
                                    ? handleDragLeave
                                    : null
                                }
                                onDrop={
                                  !deleteMode && !editingTasks
                                    ? (e) => handleDrop(e, index, selectedItem.id)
                                    : null
                                }
                                onDragEnd={
                                  !deleteMode && !editingTasks
                                    ? handleDragEnd
                                    : null
                                }
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
                                    cursor: editingTasks
                                      ? "default"
                                      : deleteMode
                                      ? "pointer"
                                      : "grab",
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
                                <td>{task.id}</td>
                                {editingTasks ? (
                                  <td>
                                    <textarea
                                      className="edit-textarea"
                                      rows={2}
                                      value={task.title}
                                      onChange={(e) =>
                                        handleTaskEditChange(
                                          task.id,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                ) : (
                                  <td>{task.title}</td>
                                )}
                                {editingTasks ? (
                                  <td>
                                    <textarea
                                      className="edit-textarea"
                                      rows={3}
                                      value={task.description}
                                      onChange={(e) =>
                                        handleTaskEditChange(
                                          task.id,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                ) : (
                                  <td>{task.description}</td>
                                )}
                                <td>
                                  {editingTasks ? (
                                    <select
                                      className="assignee-dropdown-button"
                                      value={task.priority}
                                      onChange={(e) =>
                                        handleTaskEditChange(
                                          task.id,
                                          "priority",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="alta">Alta</option>
                                      <option value="media">Media</option>
                                      <option value="baja">Baja</option>
                                    </select>
                                  ) : (
                                    <span
                                      className={`priority-badge ${task.priority}`}
                                    >
                                      {task.priority.charAt(0).toUpperCase() +
                                        task.priority.slice(1)}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {editingTasks ? (
                                    <select
                                      className="assignee-dropdown-button"
                                      value={task.assignee}
                                      onChange={(e) =>
                                        handleTaskEditChange(
                                          task.id,
                                          "assignee",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">Seleccionar</option>
                                      {teamMembers.map((m) => (
                                        <option key={m.email} value={m.email}>
                                          {m.name}
                                        </option>
                                      ))}
                                    </select>
                                  ) : assignedMember ? (
                                    assignedMember.name
                                  ) : (
                                    <select
                                      className="assignee-dropdown-button"
                                      value={task.assignee}
                                      onChange={(e) =>
                                        handleAssignee(task.id, e.target.value)
                                      }
                                    >
                                      <option value="">Asignar</option>
                                      {teamMembers.map((member) => (
                                        <option
                                          key={member.email}
                                          value={member.email}
                                        >
                                          {member.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
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
              )}
            </div>

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
                    {!editingTasks &&
                      (role === "admin" || role === "editor") && (
                        <>
                          {/* Mostrar el botón "Nueva Tarea" solo si activeRequirement es "HU" */}
                          {activeRequirement === "HU" && (
                            <button
                              className="edit-team-button"
                              style={{
                                position: "static",
                                transform: "none",
                                margin: "5px 0",
                                marginRight: "auto",
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
                          {tasks[selectedItem.id] &&
                            tasks[selectedItem.id].length > 0 && (
                              <>
                                <button
                                  className="edit-team-button"
                                  style={{
                                    position: "static",
                                    transform: "none",
                                    margin: "5px 0",
                                    left: "auto",
                                    maxWidth: "200px",
                                  }}
                                  onClick={handleStartEditTasks}
                                >
                                  Editar Tareas
                                </button>
                                <button
                                  className="delete-team-button"
                                  style={{
                                    position: "static",
                                    transform: "none",
                                    margin: "5px 0",
                                    left: "auto",
                                    width: "180px",
                                    backgroundColor: deleteMode
                                      ? "#e0e0e0"
                                      : "#ff6b6b",
                                    color: deleteMode ? "#333" : "white",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteMode(!deleteMode);
                                  }}
                                >
                                  {deleteMode ? "Cancelar" : "Eliminar Tareas"}
                                </button>
                              </>
                            )}
                        </>
                      )}
                    {editingTasks && (
                      <>
                        <button
                          className="popup-button secondary"
                          onClick={handleCancelEditTasks}
                        >
                          Cancelar
                        </button>
                        <button
                          className="popup-button primary"
                          onClick={handleSaveTasks}
                        >
                          Guardar Tareas
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="task-form-container">
                <div
                  className="task-form"
                  style={{
                    width: "100%",
                    marginLeft: "-15px",
                    marginRight: "-15px",
                    padding: "20px",
                  }}
                >
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
                      className="popup-button secondary"
                      onClick={() => {
                        setShowTaskForm(false);
                        setTaskFormData({
                          title: "",
                          description: "",
                          priority: "",
                          assignee: "",
                        });
                        setError("");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      className="save-button"
                      onClick={() => {
                        createTask();
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

      {error && <ErrorPopup message={error} onClose={() => setError("")} />}
    </div>
  );
};

export default RenderRequirementsTab;