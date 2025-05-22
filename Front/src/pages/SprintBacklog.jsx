import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup";
import SuccessPopup from "../components/SuccessPopup";
import TopAppBar from "../components/TopAppBar";
import SprintDetails from "../components/SprintDetails";
import "../css/SprintBacklog.css";

const statuses = ["To-Do", "In Progress", "Done"];

const SprintBacklog = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend
  const { projectId } = useParams();
  console.log("Project ID desde useParams:", projectId);
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [sprints, setSprints] = useState([
    {
      number: 1,
      status: "En progreso",
      startDate: "2024-04-01",
      endDate: "2024-04-14",
      tasks: [
        {
          title: "Implementar autenticación",
          description: "Crear sistema de login y registro",
          status: "En progreso",
        },
        {
          title: "Diseñar interfaz de usuario",
          description: "Crear wireframes y mockups",
          status: "Completado",
        },
      ],
    },
    {
      number: 2,
      status: "Planificado",
      startDate: "2024-04-15",
      endDate: "2024-04-28",
      tasks: [
        {
          title: "Desarrollar API",
          description: "Implementar endpoints principales",
          status: "Pendiente",
        },
        {
          title: "Configurar base de datos",
          description: "Crear esquema y migraciones",
          status: "Pendiente",
        },
      ],
    },
    {
      number: 3,
      status: "Pendiente",
      startDate: "2024-04-29",
      endDate: "2024-05-12",
      tasks: [
        {
          title: "Pruebas de integración",
          description: "Realizar pruebas de sistema completo",
          status: "Pendiente",
        },
      ],
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/projectsFB/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch project");
        const data = await response.json();
        console.log("Project data:", data);
        setProject(data);
        // Commenting out the sprints setting for now to use our fixed data
        // setSprints(data.sprints || []);
      } catch (error) {
        setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo.");
        console.error("Error fetching project:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  const handleSprintClick = (sprint) => {
    console.log("Sprint seleccionado:", sprint);
    setSelectedSprint(sprint);
  };

  const handleCloseSprintDetails = () => {
    setSelectedSprint(null);
  };

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Sprint Backlog</h1>
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
            <h1>Sprint Backlog</h1>
          </div>
          <div className="dashboard-error">
            <h2>Proyecto no encontrado</h2>
            <button onClick={() => navigate("/home")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <TopAppBar />
      <div className="main-title">
        <h1>
          {project && project.nombreProyecto
            ? `${project.nombreProyecto} - Sprint Backlog`
            : "Sprint Backlog"}
        </h1>
      </div>
      <div className="dashboard-content">
        <div className="main-dashboard-content">
          <button
            className="back-button"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            ←
          </button>

          <div className="sprints-grid">
            {sprints.length > 0 ? (
              sprints.map((sprint, index) => (
                <div
                  key={index}
                  className="sprint-card"
                  onClick={() => handleSprintClick(sprint)}
                >
                  <h3 className="sprint-title">SPRINT {sprint.number}</h3>
                  <div className="sprint-status-container">
                    <span
                      className={`status-badge ${sprint.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                  <div className="sprint-dates">
                    <div className="date-item">
                      <span className="calendar-icon">📅</span>
                      <span className="date-text">
                        {new Date(sprint.startDate).toLocaleDateString(
                          "es-ES",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <div className="date-separator">→</div>
                    <div className="date-item">
                      <span className="calendar-icon">📅</span>
                      <span className="date-text">
                        {new Date(sprint.endDate).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="sprint-tasks">
                    {sprint.tasks?.map((task, taskIndex) => (
                      <div key={taskIndex} className="sprint-task">
                        <h4>{task.title}</h4>
                        <p>{task.description}</p>
                        <span
                          className={`task-status-badge ${task.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-sprints">
                <p>No hay sprints disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
      console.log("Valor de selectedSprint:", selectedSprint);

      {selectedSprint && (
        console.log("Project ID en SprintBacklog:", projectId),

        <SprintDetails
          sprint={selectedSprint}
          sprintTasks={selectedSprint?.tasks || []}
          onClose={handleCloseSprintDetails}
          setAllTasks={setSprints}
          projectId={projectId} // Pasa el projectId aquí
        />
      )}

      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
};

export default SprintBacklog;
