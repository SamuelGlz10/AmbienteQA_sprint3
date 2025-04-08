import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Home.css"; // Import the CSS file

const Home = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const getProjects = async () => {
    const userId = localStorage.getItem("userId"); // Get the userId from localStorage

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
    // Hook para cargar los proyectos al cargar la página
    getProjects();
  }, []);

  useEffect(() => {
    // Hook para agregar proyecto generado
    if (location.state && location.state.generatedText) {
      try {
        const generatedProject = JSON.parse(location.state.generatedText);
        const newProject = {
          id: generatedProject.title, // Use the title as the ID
          descripcion: generatedProject.data,
          estatus: "Nuevo",
        };
        setProjects((prevProjects) => [...prevProjects, newProject]);
      } catch (error) {
        console.error("Failed to parse generated text:", error);
      }
    }
  }, [location.state]);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>Mis Proyectos</h1>
      </header>

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
                <td>{project.id}</td>
                <td>{project.descripcion}</td>
                <td>{project.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Project Button */}
      <div className="button-container">
        <button onClick={() => navigate("/generate")} className="main-button">
          <span className="button-text"> + Nuevo Proyecto</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
