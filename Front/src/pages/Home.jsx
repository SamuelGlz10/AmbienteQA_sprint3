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
    const result = await fetch("http://localhost:5001/projectsFB/");
    const data = await result.json();
    setProjects(data);
  };

  useEffect(() => {
    getProjects();
  }, []);

  useEffect(() => {
    if (location.state && location.state.generatedText) {
      try {
        const generatedProject = JSON.parse(location.state.generatedText);
        const newProject = {
          id: generatedProject.title, 
          descripcion: generatedProject.data,
          estatus: "Nuevo",
        };
        setProjects((prevProjects) => [...prevProjects, newProject]);
      } catch (error) {
        console.error("Failed to parse generated text:", error);
      }
    }
  }, [location.state]);

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
