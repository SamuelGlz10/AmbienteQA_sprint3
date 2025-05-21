import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../components/UserContext"; // Importar el contexto de usuario
import { AuthContext } from "../components/AuthContext"; // Importar el contexto de autenticación
import TopAppBar from "../components/TopAppBar";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el popup de éxito
import ProjectCard from "../components/ProjectCard"; // Importa el componente ProjectCard

import "../css/Home.css";

const Home = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [projects, setProjects] = useState([]);
  const [displayCount, setDisplayCount] = useState(18);
  const [sortType, setSortType] = useState("Por Defecto");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es admin
  const [isEditor, setIsEditor] = useState(false); // Estado para verificar si el usuario es editor
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito
 

  const [searchQuery, setSearchQuery] = useState(""); // Estado para manejar la búsqueda

  const navigate = useNavigate();

  const { userId, role, userLoading } = useContext(UserContext); // Obtener variables del contexto de usuario
  const { isLogin } = useContext(AuthContext); // Obtener variables del contexto de autenticación

  const getProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token no encontrado. Por favor, inicia sesión nuevamente."); // Muestra el popup de error
      setTimeout(() => {
        navigate("/login"); // Redirige al login si el token es inválido
      }, 5000);
      return;
    }

    setIsLoading(true);

    if (!userId) {
      setError("No se encontró el ID de usuario."); // Muestra el popup de error
      console.error("User ID not found.");
      return;
    }

    try {
      const result = await fetch(
        `${BACKEND_URL}/projectsFB/?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status === 401) {
        console.log("Token inválido. Redirigiendo al login...");
        setError("Token inválido. Por favor, inicia sesión nuevamente."); // Muestra el popup de error
        setTimeout(() => {
          localStorage.removeItem("token"); // Elimina el token inválido
          navigate("/login"); // Redirige al login si el token es inválido
        }, 3000);
        return;
      }

      const data = await result.json();
      setProjects(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Error al cargar los proyectos. Por favor, inténtalo de nuevo."); // Muestra el popup de error
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && isLogin) {
      getProjects();
      if (role === "admin") {
        setIsAdmin(true); // Si el rol es admin, actualizar el estado
      } else if (role === "editor") {
        setIsEditor(true); // Si el rol es editor, actualizar el estado
      }
    } else if (!isLogin && error) {
      setTimeout(() => {
        navigate("/login"); // Redirige al login si el token es inválido
      }, 5000);
    }
  }, [userLoading, isLogin, role, error]);

  const filteredProjects = projects.filter(
    (project) =>
      project.nombreProyecto
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = React.useMemo(() => {
    if (sortType === "Nombre") {
      return [...filteredProjects].sort((a, b) =>
        (a.nombreProyecto || a.id).localeCompare(b.nombreProyecto || b.id)
      );
    } else if (sortType === "Por Defecto") {
      return filteredProjects; // Sin orden específico
    }
    return filteredProjects;
  }, [filteredProjects, sortType]);

  return (
    <div className="home-container">
      <TopAppBar />

      <div className="main-title">
        <h1>Mis Proyectos</h1>
      </div>

      <div className="controls-container">
        <div className="pagination-info">
          Mostrando 1 - {Math.min(displayCount, sortedProjects.length)} de{" "}
          {sortedProjects.length}
        </div>

        <div className="search-bar-container" style={{ maxWidth: "500px" }}>
          <input
            type="text"
            placeholder="Buscar proyectos por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          {searchQuery && (
            <button
              className="clear-search-button"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
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

        {/* Search Bar */}
      </div>

      <div className="projects-grid">
        {(isAdmin || isEditor) && (
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
        {!isLoading && sortedProjects.length === 0 ? (
          <div className="no-projects-message">
            {isAdmin ? (
              <p>No hay proyectos disponibles, crea uno nuevo.</p>
            ) : (
              <p>No tienes proyectos asignados. Contacta a un administrador.</p>
            )}
          </div>
        ) : (
          sortedProjects.slice(0, displayCount).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando proyectos...</p>
        </div>
      )}

      <ErrorPopup message={error} onClose={() => setError(null)} />
      <SuccessPopup
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
};

export default Home;
