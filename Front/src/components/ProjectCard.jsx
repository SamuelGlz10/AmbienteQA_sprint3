import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ProjectCard.css";

const ProjectCard = ({ project, initialBackgroundColor = "#7a5a96" }) => {
  const navigate = useNavigate();
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // Estado para controlar la descripción

  const handleColorChange = (color) => {
    setBackgroundColor(color); // Actualiza el color de fondo
    setShowColorOptions(false); // Cierra las opciones de color
  };

  return (
    <div
      className="project-card"
      onClick={() => navigate(`/project/${project.id}`)} // Redirige al proyecto al hacer clic
      style={{ cursor: "pointer" }} // Cambia el cursor para indicar que es clicable
    >
      {/* Barra de color en la parte superior */}
      <div
        className="color-bar"
        style={{
          backgroundColor: backgroundColor, // Usa el color dinámico
        }}
        onClick={(e) => e.stopPropagation()} // Evita que el clic en la barra de color redirija
      >
        {/* Ícono de lápiz para cambiar el color */}
        <button
          className="color-picker-button"
          onClick={(e) => {
            e.stopPropagation(); // Evita que el clic en el botón redirija
            setShowColorOptions(!showColorOptions);
          }}
        >
          &#8942; {/* Tres puntos verticales */}
        </button>
        {showColorOptions && (
          <div className="color-options">
            <button
              className="color-option"
              style={{ backgroundColor: "#4b0082" }} // Morado oscuro
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic en la opción redirija
                handleColorChange("#4b0082");
              }}
            />
            <button
              className="color-option"
              style={{ backgroundColor: "#7a5a96" }} // Morado
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic en la opción redirija
                handleColorChange("#7a5a96");
              }}
            />
            <button
              className="color-option"
              style={{ backgroundColor: "#d8bfd8" }} // Morado claro
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic en la opción redirija
                handleColorChange("#d8bfd8");
              }}
            />
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="project-info">
        <h3>{project.nombreProyecto || project.id}</h3>
        <p>
          {isDescriptionExpanded
            ? project.descripcion // Muestra la descripción completa si está expandida
            : project.descripcion?.length > 70
            ? `${project.descripcion.slice(0, 70)}... `
            : project.descripcion || "Sin descripción"}
          {project.descripcion?.length > 70 && (
            <span
              className="see-more"
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic en "Ver más" redirija toda la tarjeta
                setIsDescriptionExpanded(!isDescriptionExpanded); // Alterna entre truncado y completo
              }}
            >
              {isDescriptionExpanded ? " Ver menos" : " Ver más"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProjectCard;