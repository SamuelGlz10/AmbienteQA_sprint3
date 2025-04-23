import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/Dashboard.css";

const Dashboard = () => {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("EP"); // Default to EP tab

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
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="project-dashboard">
      <h1>{projectData.nombreProyecto}</h1>
      <p>{projectData.descripcion}</p>

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

      {/* Content for active tab */}
      <div className="tab-content">{renderList()}</div>

      <p>Status: {projectData.estatus}</p>
    </div>
  );
};

export default Dashboard;
