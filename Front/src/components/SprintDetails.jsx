import React, { useState } from "react";
import "../css/SprintDetails.css";

const SprintDetails = ({ sprint, sprintTasks, onClose, setAllTasks, projectId }) => {
  console.log("Props recibidas en SprintDetails:", { sprint, sprintTasks, projectId });
  const [draggedTask, setDraggedTask] = useState(null);

  // Manejar el inicio del arrastre de una tarea
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  // Permitir que una tarea se arrastre sobre una columna
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Manejar el soltar de una tarea en una nueva columna
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask) {
      if (!projectId) {
        console.error("El ID del proyecto no está definido");
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }
  
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/projectsFB/${projectId}/tasks`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              taskId: draggedTask.id,
              estado: newStatus,
            }),
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error al actualizar la tarea en Firestore:", errorData);
          return;
        }
  
        // Actualizar el estado local después de una solicitud exitosa
        setAllTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === draggedTask.id ? { ...task, estado: newStatus } : task
          )
        );
  
        console.log("Tarea actualizada correctamente en el frontend");
      } catch (error) {
        console.error("Error al conectar con Firestore:", error);
      }
  
      setDraggedTask(null);
    }
  };

  // Filtrar las tareas por estado
  const getTasksByStatus = (status) => {
    return sprintTasks.filter((task) => task.estado === status);
  };
  
  // Calcular el progreso del sprint
  const calculateProgress = () => {
    const completedTasks = sprintTasks.filter(
      (task) => task.estado === "Completado"
    ).length;
    return sprintTasks.length > 0
      ? (completedTasks / sprintTasks.length) * 100
      : 0;
  };

  return (
    <div className="sprint-details-overlay" onClick={onClose}>
      <div
        className="sprint-details-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {/* Encabezado del sprint */}
        <div className="sprint-header">
          <h2>Sprint {sprint.number}</h2>
          <div className="sprint-dates">
            <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
            <span>→</span>
            <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {Math.round(calculateProgress())}% Completado
          </span>
        </div>

        {/* Tablero Kanban */}
        <div className="kanban-board">
          {/* Columna de tareas pendientes */}
          <div
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Pendiente")}
          >
            <h3>Pendiente</h3>
            {getTasksByStatus("Pendiente").map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <h4>
                  {task.id}: {task.titulo}
                </h4>
                <p>{task.descripcion}</p>
              </div>
            ))}
          </div>

          {/* Columna de tareas en progreso */}
          <div
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "En progreso")}
          >
            <h3>En Progreso</h3>
            {getTasksByStatus("En progreso").map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <h4>
                  {task.id}: {task.titulo}
                </h4>
                <p>{task.descripcion}</p>
              </div>
            ))}
          </div>

          {/* Columna de tareas completadas */}
          <div
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Completado")}
          >
            <h3>Completado</h3>
            {getTasksByStatus("Completado").map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <h4>
                  {task.id}: {task.titulo}
                </h4>
                <p>{task.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintDetails;
