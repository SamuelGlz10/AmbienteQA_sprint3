import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const getProjects = async () => {
    const result = await fetch("http://localhost:5001/projectsFB/");
    const data = await result.json();
    setProjects(data);
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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-purple-100 p-6 text-center rounded-md shadow-md">
        <h1 className="text-2xl font-semibold">Mis Proyectos</h1>
      </header>

      {/* Projects Table */}
      <div className="mt-6 flex justify-center">
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Descripción</th>
              <th className="py-2 px-4 border-b">Estatus</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="py-2 px-4 border-b">{project.id}</td>
                <td className="py-2 px-4 border-b">{project.descripcion}</td>
                <td className="py-2 px-4 border-b">{project.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Project Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate("/generate")}
          className="flex flex-col items-center px-6 py-4 bg-purple-100 rounded-full shadow-md"
        >
          <span className="text-2xl">+</span>
          <span className="text-sm font-semibold text-white">
            Nuevo Proyecto
          </span>
        </button>
      </div>
    </div>
  );
};

export default Home;
