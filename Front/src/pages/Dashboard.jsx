import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el popup de éxito
import TopAppBar from "../components/TopAppBar";
import EditMemberPopup from "../components/EditMemeberPopup";
import RenderRequirementsTab from "../components/RenderRequirementsTab";
import TeamEditPopup from "../components/TeamEditPopup";
import ModificationHistory from "../components/ModificationHistory";
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
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
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

  // UseEffect para cargar el proyecto y los miembros del equipo
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProject();
      const projectMembers = await fetchTeamMembers(); // Llamar primero para filtrar usuarios
      await fetchAvailableUsers(projectMembers);
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

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
      setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo.");
      console.error("Error fetching project:", error);
    }
  };

  const fetchAvailableUsers = async (projectMembers) => {
    try {
      const response = await fetch("http://localhost:5001/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      if (data.success) {
        const mappedUsers = data.users.map((user) => ({
          id: user.UserID,
          name: user.username,
          lastname: user.lastname,
          role: user.role,
          email: user.email,
          initials: `${user.username[0] || ""}${
            user.lastname?.[0] || ""
          }`.toUpperCase(),
        }));

        // Filtrar los usuarios que ya son miembros del equipo
        const filteredUsers = mappedUsers.filter(
          (user) => !projectMembers.some((member) => member.id === user.id)
        );

        setAvailableMembers(filteredUsers);
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/projectsFB/${projectId}/team`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();

      if (data.success) {
        const mappedTeamMembers = data.teamMembers.map((member) => ({
          id: member.UserID,
          name: member.username,
          lastname: member.lastname,
          title: member.title,
          email: member.email,
          initials: `${member.username[0] || ""}${
            member.lastname?.[0] || ""
          }`.toUpperCase(),
        }));

        setTeamMembers(mappedTeamMembers);
        return mappedTeamMembers; // Devolver los miembros del equipo para filtrar usuarios
      } else {
        console.error("Error fetching team members:", data.message);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Error al cargar los miembros del equipo.");
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/projectsFB/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const handleSaveEdit = async () => {
    if (!selectedItem || !project) return;

    try {
      setSaveStatus({ loading: true, error: null, success: false });

      const updatedProject = {
        ...project,
        [activeRequirement]: project[activeRequirement].map((item) =>
          item.id === selectedItem.id
            ? { ...item, titulo: editData.title, data: editData.description }
            : item
        ),
      };
      setProject(updatedProject);

      const response = await fetch(
        `http://localhost:5001/projectsFB/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...updatedProject,
            nombreProyecto: updatedProject.nombreProyecto,
            descripcion: updatedProject.descripcion,
            [activeRequirement]: updatedProject[activeRequirement],
          }),
        }
      );

      if (!response.ok) throw new Error("Error al guardar en el servidor");

      const data = await response.json();

      setSaveStatus({ loading: false, error: null, success: true });
      setSuccessMessage("Cambios guardados exitosamente");

      setEditing(false);

      setTimeout(() => {
        setSaveStatus({ loading: false, error: null, success: false });
      }, 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaveStatus({
        loading: false,
        error: "Error al guardar los cambios",
        success: false,
      });
      setError(
        "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeErrorPopup = () => {
    setError(null); // Cierra el popup de error
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null); // Cierra el popup de éxito
  };

  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setEditData({
      title: item.titulo,
      description: item.data,
    });
    setShowPopup(true);

    // Fetch tasks for this element
    try {
      const resp = await fetch(
        `http://localhost:5001/projectsFB/${projectId}/tasks?requirementType=${activeRequirement}&elementId=${item.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch tasks");
      const { tasks: dbTasks } = await resp.json();
      // Mapear al formato de front
      const mapped = dbTasks.map((t) => ({
        id: Number(t.id),
        title: t.titulo,
        description: t.descripcion,
        priority: t.prioridad,
        assignee: teamMembers.find((m) => m.id === t.asignados)?.email || "",
      }));
      setTasks((prev) => ({ ...prev, [item.id]: mapped }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
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

  const handleSaveTeam = async (addedMembers, removedMembers) => {
    try {
      // 1) Vincular los nuevos
      await Promise.all(
        addedMembers.map((m) =>
          fetch("http://localhost:5001/projectsFB/linkUserToProject", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: m.id, projectId }),
          })
        )
      );

      // 2) Desvincular los eliminados
      await Promise.all(
        removedMembers.map((m) =>
          fetch("http://localhost:5001/projectsFB/unlinkUserFromProject", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userId: m.id, projectId }),
          })
        )
      );

      // 3) Actualizar estado local
      setTeamMembers((prev) => [
        // quitamos los eliminados
        ...prev.filter(
          (tm) => !removedMembers.find((rm) => rm.email === tm.email)
        ),
        // añadimos los nuevos
        ...addedMembers,
      ]);

      setAvailableMembers((prev) => [
        // recuperamos a los eliminados
        ...removedMembers,
        // quitamos a los recién añadidos
        ...prev.filter((am) => !addedMembers.find((m) => m.email === am.email)),
      ]);

      setShowTeamPopup(false);
      setSuccessMessage("Equipo actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setError("No se pudieron guardar los cambios de equipo.");
    }
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

  const handleRemoveMember = async (member) => {
    try {
      // Hacer la llamada a la API para desvincular el usuario del proyecto
      await fetch("http://localhost:5001/projectsFB/unlinkUserFromProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: member.id,
          projectId,
        }),
      });

      // Actualizar el estado de los miembros del equipo y los miembros disponibles
      setTeamMembers((prev) =>
        prev.filter((teamMember) => teamMember.email !== member.email)
      );
      setAvailableMembers((prev) => [...prev, member]);
      setEditingMember(null);
      setMemberAction(null);
      setSuccessMessage("Miembro eliminado exitosamente.");
    } catch (error) {
      console.error("Error removing user from project:", error);
      setError("Error al eliminar miembro del proyecto.");
    }
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
    setSelectedItem(null);
    setTaskFormData({
      title: "",
      description: "",
      priority: "",
      assignee: "",
    });
    setEditing(false);
    setDeleteMode(false);
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

  const handleDrop = async (e, targetIndex, elementId) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    document
      .querySelectorAll(".dragging")
      .forEach((el) => el.classList.remove("dragging"));

    const sourceIndex = parseInt(e.dataTransfer.getData("index"));
    if (sourceIndex === targetIndex) return;

    const tasksCopy = { ...tasks };
    const currentTasks = [...(tasksCopy[elementId] || [])];
    const draggedTask = currentTasks[sourceIndex];
    currentTasks.splice(sourceIndex, 1);
    currentTasks.splice(targetIndex, 0, draggedTask);
    tasksCopy[elementId] = currentTasks;
    setTasks(tasksCopy);

    // Persistir el nuevo orden en la base de datos
    try {
      const payload = {
        requirementType: activeRequirement,
        elementId,
        tasks: tasksCopy[elementId].map((task) => ({
          id: task.id.toString(),
          titulo: task.title,
          descripcion: task.description,
          prioridad: task.priority,
          asignados:
            teamMembers.find((m) => m.email === task.assignee)?.id || null,
        })),
      };
      await fetch(`http://localhost:5001/projectsFB/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error al actualizar el orden de tareas:", err);
      setError("Error al actualizar el orden de las tareas en el servidor.");
    }
  };

  // Modificar la función handleDeleteTask para desactivar el modo eliminación
  const handleDeleteTask = async (taskId, elementId) => {
    // 1. Actualizar estado local
    const updatedTasksArr = (tasks[elementId] || []).filter(
      (task) => task.id !== taskId
    );
    setTasks((prev) => ({
      ...prev,
      [elementId]: updatedTasksArr,
    }));
    setSuccessMessage("Tarea eliminada exitosamente.");
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
    setDeleteMode(false);

    // 2. Persistir eliminación en la base de datos
    try {
      const payload = {
        requirementType: activeRequirement,
        elementId,
        tasks: updatedTasksArr.map((task) => ({
          id: task.id.toString(),
          titulo: task.title,
          descripcion: task.description,
          prioridad: task.priority,
          asignados:
            teamMembers.find((m) => m.email === task.assignee)?.id || null,
        })),
      };
      await fetch(`http://localhost:5001/projectsFB/${projectId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error al eliminar tarea en servidor:", err);
      setError("Error al eliminar la tarea en el servidor.");
    }
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

      <div className="modification-history-section">
        <ModificationHistory projectId={projectId} />
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <TopAppBar />
      <div className="main-title">
        <h1>
          {project && project.nombreProyecto
            ? project.nombreProyecto
            : "Cargando proyecto..."}
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
                activeTab === "elements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("elements")}
            >
              Elementos
            </button>
            <button
              className="tab-button"
              onClick={() => navigate(`/project/${projectId}/sprint-backlog`)}
            >
              Sprint Backlog
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
                editing={editing}
                setEditing={setEditing}
                saveStatus={saveStatus}
                setSaveStatus={setSaveStatus}
                editData={editData}
                setEditData={setEditData}
                handleSaveEdit={handleSaveEdit}
                handleInputChange={handleInputChange}
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
                  <div className="member-role">{member.title}</div>
                  <div className="member-email">{member.email}</div>
                </div>
                {(role === "editor" || role === "admin") && (
                  <div className="member-actions">
                    {/* <button
                      className="member-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMemberMenuClick(e, member);
                      }}
                    >
                      ⋮
                    </button> */}
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
          handleSaveTeam={handleSaveTeam} // recibe (addedMembers, removedMembers)
          handleCancelTeam={() => setShowTeamPopup(false)}
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
