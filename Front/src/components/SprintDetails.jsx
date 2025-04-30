import React, { useState } from 'react';
import '../css/SprintDetails.css';

const SprintDetails = ({ sprint, onClose }) => {
  const [tasks, setTasks] = useState(sprint.tasks || []);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask) {
      const updatedTasks = tasks.map(task => 
        task.title === draggedTask.title 
          ? { ...task, status: newStatus }
          : task
      );
      setTasks(updatedTasks);
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const calculateProgress = () => {
    const completedTasks = tasks.filter(task => task.status === 'Completado').length;
    return (completedTasks / tasks.length) * 100;
  };

  return (
    <div className="sprint-details-overlay" onClick={onClose}>
      <div className="sprint-details-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="sprint-header">
          <h2>Sprint {sprint.number}</h2>
          <div className="sprint-dates">
            <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
            <span>→</span>
            <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(calculateProgress())}% Completado</span>
        </div>

        <div className="kanban-board">
          <div 
            className="kanban-column"
            onDragOver={e => handleDragOver(e, 'Pendiente')}
            onDrop={e => handleDrop(e, 'Pendiente')}
          >
            <h3>Pendiente</h3>
            {getTasksByStatus('Pendiente').map((task, index) => (
              <div
                key={index}
                className="task-card"
                draggable
                onDragStart={e => handleDragStart(e, task)}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
            ))}
          </div>

          <div 
            className="kanban-column"
            onDragOver={e => handleDragOver(e, 'En progreso')}
            onDrop={e => handleDrop(e, 'En progreso')}
          >
            <h3>En Progreso</h3>
            {getTasksByStatus('En progreso').map((task, index) => (
              <div
                key={index}
                className="task-card"
                draggable
                onDragStart={e => handleDragStart(e, task)}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
            ))}
          </div>

          <div 
            className="kanban-column"
            onDragOver={e => handleDragOver(e, 'Completado')}
            onDrop={e => handleDrop(e, 'Completado')}
          >
            <h3>Completado</h3>
            {getTasksByStatus('Completado').map((task, index) => (
              <div
                key={index}
                className="task-card"
                draggable
                onDragStart={e => handleDragStart(e, task)}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintDetails; 