const renderRequirementsTab = () => (
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
                <div className="description-text">{selectedItem.data}</div>
              )}
            </div>

            <div className="tasks-section">
              <h4>Tareas relacionadas:</h4>
              {tasks[selectedItem.id] && tasks[selectedItem.id].length > 0 ? (
                <div className="tasks-table-container">
                  <table className="tasks-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Prioridad</th>
                        <th>Asignado a</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks[selectedItem.id].map((task, index) => {
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
                            >
                              {!deleteMode ? (
                                <span className="drag-icon">≡</span>
                              ) : (
                                <span className="delete-mode-icon">×</span>
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
                {!deleteMode && (
                  <button
                    className="new-task-button"
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
                    <button
                      className={`delete-mode-button ${
                        deleteMode ? "cancel" : ""
                      }`}
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

          {showTaskForm && (
            <div className="task-form-container">
              <div className="task-form">
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
                      setTaskFormData({
                        title: "",
                        description: "",
                        priority: "",
                        assignee: "",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="save-button"
                    onClick={() => {
                      // Validación de campos
                      if (
                        !taskFormData.title.trim() ||
                        !taskFormData.description.trim() ||
                        !taskFormData.priority ||
                        !taskFormData.assignee
                      ) {
                        setError("Por favor complete todos los campos");
                        return;
                      }

                      const newTask = {
                        id: Date.now(),
                        title: taskFormData.title,
                        description: taskFormData.description,
                        priority: taskFormData.priority,
                        assignee: taskFormData.assignee,
                      };

                      setTasks((prevTasks) => ({
                        ...prevTasks,
                        [selectedItem.id]: [
                          ...(prevTasks[selectedItem.id] || []),
                          newTask,
                        ],
                      }));

                      setShowTaskForm(false);
                      setTaskFormData({
                        title: "",
                        description: "",
                        priority: "",
                        assignee: "",
                      });
                      setSuccessMessage("Tarea creada exitosamente");
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
  </div>
);
