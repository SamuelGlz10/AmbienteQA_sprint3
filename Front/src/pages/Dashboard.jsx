import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/Dashboard.css";

const Dashboard = () => {
  const { projectId } = useParams(); // Get the project ID from the URL
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading project data...</div>;
  }

  if (!projectData) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="project-dashboard">
      <h1>{projectData.nombreProyecto}</h1>
      <p>{projectData.descripcion}</p>
      <p>Status: {projectData.estatus}</p>
      {/* Add more project details here */}
    </div>
  );
};

export default Dashboard;
