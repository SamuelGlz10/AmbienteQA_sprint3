import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el popup de éxito
import TopAppBar from "../components/TopAppBar";
import EditMemberPopup from "../components/EditMemeberPopup";
import RenderRequirementsTab from "../components/RenderRequirementsTab";
import TeamEditPopup from "../components/TeamEditPopup";
import "../css/Dashboard.css";

const Dashboard = () => {
  const role = localStorage.getItem("role");
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeRequirement, setActiveRequirement] = useState("EP");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([
    {
      name: "Loretta Veiga",
      role: "Product Owner",
      email: "lorettav@softedge.com",
      initials: "LV",
    },
    {
      name: "Andres Quintanar",
      role: "Scrum Master",
      email: "andyqv@softedge.com",
      initials: "AQ",
    },
    {
      name: "Gerardo Leiva",
      role: "Backend Developer",
      email: "gerardo.leiva@softedge.com",
      initials: "GL",
    },
  ]);
  const [availableMembers, setAvailableMembers] = useState([
    {
      name: "Juan Pérez",
      role: "Frontend Developer",
      email: "juan.perez@softedge.com",
      initials: "JP",
    },
    {
      name: "María García",
      role: "UX Designer",
      email: "maria.garcia@softedge.com",
      initials: "MG",
    },
  ]);
  const [editData, setEditData] = useState({
    nombreProyecto: "",
    descripcion: "",
  });
  const [showMemberMenu, setShowMemberMenu] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [memberAction, setMemberAction] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "",
    assignee: "",
  });
  const [tasks, setTasks] = useState({});

  // Agregar estos nuevos estados para el manejo de la eliminación de tareas
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Agregar estos estados para manejar el modo de eliminación
  const [deleteMode, setDeleteMode] = useState(false);
  const [taskToSelect, setTaskToSelect] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/projectsFB/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch project");
        const data = await response.json();
        setProject(data);
        setEditData({
          nombreProyecto: data.nombreProyecto,
          descripcion: data.descripcion,
        });
      } catch (error) {
        setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo."); // Muestra el popup de error
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/projectsFB/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) throw new Error("Failed to update project");

      setProject((prev) => ({
        ...prev,
        ...editData,
      }));
      setIsEditing(false);
      console.log("Project updated successfully");
      setSuccessMessage("Proyecto actualizado exitosamente."); // Muestra el popup de éxito
    } catch (error) {
      console.error("Error updating project:", error);
      setError(
        "Error al actualizar el proyecto. Por favor, inténtalo de nuevo."
      ); // Muestra el popup de error
    }
  };

  const closeErrorPopup = () => {
    setError(null); // Cierra el popup de error
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null); // Cierra el popup de éxito
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const handleStatCardClick = (requirementType) => {
    setActiveTab("requirements");
    setActiveRequirement(requirementType);
  };

  const handleEditTeam = () => {
    setShowTeamPopup(true);
  };

  const handleMemberSelect = (member) => {
    setSelectedMembers((prev) => {
      if (prev.some((m) => m.email === member.email)) {
        return prev.filter((m) => m.email !== member.email);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSaveTeam = () => {
    setTeamMembers((prev) => [...prev, ...selectedMembers]);
    setAvailableMembers((prev) =>
      prev.filter(
        (member) =>
          !selectedMembers.some((selected) => selected.email === member.email)
      )
    );
    setShowTeamPopup(false);
    setSelectedMembers([]);
  };

  const handleCancelTeam = () => {
    setShowTeamPopup(false);
    setSelectedMembers([]);
  };

  const handleMemberMenuClick = (e, member) => {
    e.stopPropagation();
    setShowMemberMenu(showMemberMenu === member.email ? null : member.email);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberAction("edit");
    setShowMemberMenu(null);
  };

  const handleRemoveMember = (member) => {
    setEditingMember(member);
    setMemberAction("remove");
    setShowMemberMenu(null);
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.email === editingMember.email ? editingMember : member
        )
      );
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleConfirmRemove = () => {
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.filter((member) => member.email !== editingMember.email)
      );
      setAvailableMembers((prev) => [...prev, editingMember]);
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowTaskForm(false);
    setTaskFormData({
      title: "",
      description: "",
      priority: "",
      assignee: "",
    });
    setDeleteMode(false); // Turn off delete mode when closing the popup
  };

  // Agregar un manejador de eventos para el drag and drop
  const handleDragStart = (e, taskId, index) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("index", index);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    // Eliminar la clase dragging de todos los elementos
    document.querySelectorAll(".dragging").forEach((element) => {
      element.classList.remove("dragging");
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, targetIndex, elementId) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    // Eliminar la clase dragging de todos los elementos
    document.querySelectorAll(".dragging").forEach((element) => {
      element.classList.remove("dragging");
    });

    const draggedTaskId = e.dataTransfer.getData("taskId");
    const sourceIndex = parseInt(e.dataTransfer.getData("index"));

    // Si se suelta en el mismo lugar, no hacemos nada
    if (sourceIndex === targetIndex) return;

    // Crear una copia del array de tareas actual para el elemento seleccionado
    const tasksCopy = { ...tasks };
    const currentTasks = [...(tasksCopy[elementId] || [])];

    // Obtener la tarea arrastrada
    const draggedTask = currentTasks[sourceIndex];

    // Eliminar la tarea de su posición original
    currentTasks.splice(sourceIndex, 1);

    // Insertar la tarea en la nueva posición
    currentTasks.splice(targetIndex, 0, draggedTask);

    // Actualizar el estado con las tareas reordenadas
    tasksCopy[elementId] = currentTasks;
    setTasks(tasksCopy);
  };

  // Modificar la función handleDeleteTask para desactivar el modo eliminación
  const handleDeleteTask = (taskId, elementId) => {
    // Actualizar el estado eliminando la tarea del arreglo
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[elementId] = updatedTasks[elementId].filter(
        (task) => task.id !== taskId
      );
      return updatedTasks;
    });

    // Mostrar mensaje de éxito
    setSuccessMessage("Tarea eliminada exitosamente.");

    // Cerrar el diálogo de confirmación y desactivar modo eliminación
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
    setDeleteMode(false); // Desactivar modo eliminación al terminar
  };

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-error">
            <h2>Proyecto no encontrado</h2>
            <button onClick={() => navigate("/home")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="overview-section">
      <div className="project-header">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.nombreProyecto}
              onChange={(e) =>
                setEditData({ ...editData, nombreProyecto: e.target.value })
              }
              className="edit-input title"
            />
            <textarea
              value={editData.descripcion}
              onChange={(e) =>
                setEditData({ ...editData, descripcion: e.target.value })
              }
              className="edit-input description"
            />
            <div className="edit-actions">
              <button className="save-button" onClick={handleSave}>
                Guardar
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{project.nombreProyecto}</h1>
            <p>{project.descripcion}</p>
            {(role === "admin" || role === "editor") && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Editar Proyecto
              </button>
            )}
          </>
        )}
      </div>

      <div className="stats-grid">
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("EP")}
        >
          <h3>Épicas</h3>
          <p className="stat-number">{project.EP?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RF")}
        >
          <h3>Requerimientos Funcionales</h3>
          <p className="stat-number">{project.RF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RNF")}
        >
          <h3>Requerimientos No Funcionales</h3>
          <p className="stat-number">{project.RNF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("HU")}
        >
          <h3>Historias de Usuario</h3>
          <p className="stat-number">{project.HU?.length || 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <TopAppBar />
      <div className="main-title">
        <h1>
          {project && project.nombreProyecto
            ? `${project.nombreProyecto} - Dashboard`
            : "Dashboard"}
        </h1>
      </div>
      <div className="dashboard-content">
        <div className="main-dashboard-content">
          <button className="back-button" onClick={() => navigate("/home")}>
            ←
          </button>
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Vista General
            </button>
            <button
              className={`tab-button ${
                activeTab === "requirements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("requirements")}
            >
              Elementos
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "overview" ? (
              renderOverviewTab()
            ) : (
              <RenderRequirementsTab
                project={project}
                activeRequirement={activeRequirement}
                setActiveRequirement={setActiveRequirement}
                handleItemClick={handleItemClick}
                showPopup={showPopup}
                selectedItem={selectedItem}
                handleClosePopup={handleClosePopup}
                tasks={tasks}
                setTasks={setTasks}
                teamMembers={teamMembers}
                setTaskToDelete={setTaskToDelete}
                deleteMode={deleteMode}
                setDeleteMode={setDeleteMode}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDragEnter={handleDragEnter}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
                showTaskForm={showTaskForm}
                setShowTaskForm={setShowTaskForm}
                taskFormData={taskFormData}
                setTaskFormData={setTaskFormData}
                setSuccessMessage={setSuccessMessage}
                setShowDeleteConfirmation={setShowDeleteConfirmation}
                role={role}
              />
            )}
          </div>
        </div>

        <div className="team-members-container">
          <h2 className="team-members-title">Equipo del Proyecto</h2>
          <div className="team-members-content">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="member-profile">{member.initials}</div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                  <div className="member-email">{member.email}</div>
                </div>
                {(role === "editor" || role === "admin") && (
                  <div className="member-actions">
                    <button
                      className="member-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberMenuClick(e, member);
                      }}
                    >
                      ⋮
                    </button>
                    {showMemberMenu === member.email && (
                      <div className="member-menu">
                        {role === "admin" && (
                          <button onClick={() => handleEditMember(member)}>
                            Editar
                          </button>
                        )}
                        <button onClick={() => handleRemoveMember(member)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {(role === "admin" || role === "editor") && (
            <button className="edit-team-button" onClick={handleEditTeam}>
              Agregar Miembros
            </button>
          )}
        </div>
      </div>

      {editingMember && (
        <EditMemberPopup
          editingMember={editingMember}
          setEditingMember={setEditingMember}
          memberAction={memberAction}
          setMemberAction={setMemberAction}
          setTeamMembers={setTeamMembers}
          setAvailableMembers={setAvailableMembers}
        />
      )}

      {showTeamPopup && (
        <TeamEditPopup
          availableMembers={availableMembers}
          teamMembers={teamMembers}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          handleMemberSelect={handleMemberSelect}
          handleSaveTeam={handleSaveTeam}
          handleCancelTeam={handleCancelTeam}
          setShowTeamPopup={setShowTeamPopup}
        />
      )}
      {/* Popup de error */}
      <ErrorPopup message={error} onClose={closeErrorPopup} />

      {/* Popup de éxito */}
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />

      {/* Confirmación de eliminación de tarea */}
      {showDeleteConfirmation && taskToDelete && (
        <div
          className="popup-overlay"
          onClick={() => setShowDeleteConfirmation(false)}
        >
          <div
            className="popup-content confirmation-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <button
              className="popup-close"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              ×
            </button>
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Estás seguro que deseas eliminar la tarea "{taskToDelete.title}"?
            </p>
            <p>Esta acción no se puede deshacer.</p>
            <div className="confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="delete-button"
                onClick={() =>
                  handleDeleteTask(taskToDelete.id, taskToDelete.elementId)
                }
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
