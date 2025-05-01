import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../css/SprintBacklog.css";

const statuses = ["To-Do", "In Progress", "Done"];

const SprintBacklog = () => {
  const { projectId, sprintNumber } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://softedge-back.vercel.app/api/projects/${projectId}/sprints/${sprintNumber}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) throw new Error("Error al cargar tareas");
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las tareas");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId, sprintNumber]);

  if (loading) return <p>Cargando tareas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="sprint-backlog-container">
      <h2>Sprint {sprintNumber} – Backlog</h2>
      <div className="columns">
        {statuses.map((status) => (
          <div key={status} className={`column column-${status.replace(/\s+/g, "-").toLowerCase()}`}>
            <h3>{status}</h3>
            <div className="task-list">
              {tasks
                .filter((t) => t.status === status)
                .map((t) => (
                  <div key={t.id} className="task-card">
                    <h4>{t.title}</h4>
                    <p>{t.description}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintBacklog;