import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../components/UserContext"; // Importar el contexto de usuario
import TopAppBar from "../components/TopAppBar";

import "../css/Home.css";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [displayCount, setDisplayCount] = useState(18);
  const [sortType, setSortType] = useState("Por Defecto");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es admin
  const navigate = useNavigate();
  const location = useLocation();

  const { userId } = useContext(UserContext); // Obtener el userID del contexto
  const { role } = useContext(UserContext); // Obtener el rol del contexto

  const getProjects = async () => {
    if (!userId) {
      alert("No se encontró el ID de usuario.");
      console.error("User ID not found.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await fetch(
        `http://localhost:5001/projectsFB/?userId=${userId}`
      );
      const data = await result.json();
      setProjects(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    getProjects();
    if(role === "admin") {
      setIsAdmin(true); // Si el rol es admin, actualizar el estado
    }
  }, []);

  const sortProjects = (projects) => {
    if (sortType === "Nombre") {
      return [...projects].sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortType === "Fecha") {
      return projects;
    } else {
      return projects;
    }
  };

  const sortedProjects = sortProjects(projects);

  return (
    <div className="white-container">
      <TopAppBar />

      <div className="home-container">
        <div className="main-title">
          <h1>Mis Proyectos</h1>
        </div>

        <div className="controls-container">
          <div className="pagination-info">
            Mostrando 1 - {Math.min(displayCount, projects.length)} de{" "}
            {projects.length}
          </div>

          <div className="sort-control">
            <span>Ordenar por:</span>
            <select
              className="sort-select"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option>Por Defecto</option>
              <option>Nombre</option>
            </select>
          </div>
        </div>

        <div className="projects-grid">
          {sortedProjects.slice(0, displayCount).map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <div className="project-image"></div>
              <div className="project-info">
                <h3>{project.nombreProyecto || project.id}</h3>
                <p>{project.descripcion}</p>
              </div>
            </div>
          ))}

          {isAdmin && (
            <div
              className="new-project-card"
              onClick={() => navigate("/generate")}
            >
              <div className="plus-icon">+</div>
              <div className="new-project-text">
                NUEVO
                <br />
                PROYECTO
              </div>
            </div>
          )}
        </div>
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Cargando proyectos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
