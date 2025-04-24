import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/Dashboard.css";

const Dashboard = () => {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("EP");

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/projectsFB/${projectId}`
        );
        const data = await response.json();
        setProjectData(data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) return <div>Loading project data...</div>;
  if (!projectData) return <div>Project not found.</div>;

  const tabContent = {
    EP: projectData.EP || [],
    HU: projectData.HU || [],
    RF: projectData.RF || [],
    RNF: projectData.RNF || [],
  };

  const renderList = () => {
    return (
      <ul>
        {tabContent[activeTab].map((item, index) => (
          <li key={index}>
            <strong>{item.id}: {item.titulo}</strong> - {item.data}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="project-dashboard">
      <h1>{projectData.nombreProyecto}</h1>
      <p>Fecha de creación: {projectData.fechaCreacion}</p>
      <p>{projectData.descripcion}</p>
      <p>Estatus: {projectData.estatus}</p>

      {/* Tabs */}
      <div className="tabs">
        {["EP", "HU", "RF", "RNF"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active-tab" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenido para las tabs */}
      <div className="tab-content">{renderList()}</div>
    </div>
  );
};

export default Dashboard;
