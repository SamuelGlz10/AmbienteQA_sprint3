import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Home.css"; 

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [displayCount, setDisplayCount] = useState(18);
  const [sortType, setSortType] = useState("Por Defecto");
  const navigate = useNavigate();
  const location = useLocation();

  const getProjects = async () => {
    const userId = localStorage.getItem("UserID"); // Get the userId from localStorage

    if (!userId) {
      console.error("User ID not found in localStorage.");
      return;
    }

    try {
      const result = await fetch(
        `http://localhost:5001/projectsFB/?userId=${userId}`
      );
      const data = await result.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    getProjects();
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
    <div className="home-container">
      <div className="main-title">
        <h1>Mis Proyectos</h1>
      </div>


      <div className="controls-container">
        <div className="pagination-info">
          Mostrando 1 - {Math.min(displayCount, projects.length)} de {projects.length}
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

      {/* Projects Table */}
      <div className="table-container">
        <table className="projects-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.nombreProyecto || project.id}</td>
                <td>{project.descripcion}</td>
                <td>{project.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      <div className="projects-grid">
        {sortedProjects.slice(0, displayCount).map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-image"></div>
            <div className="project-info">
              <h3>{project.id}</h3>
              <p>{project.descripcion}</p>
            </div>
          </div>
        ))}
        
        <div className="new-project-card" onClick={() => navigate("/generate")}>
          <div className="plus-icon">+</div>
          <div className="new-project-text">
            NUEVO<br />PROYECTO
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
