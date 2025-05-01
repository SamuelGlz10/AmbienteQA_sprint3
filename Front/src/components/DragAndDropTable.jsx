import React, { useState } from "react";
import "../css/Dashboard.css";

const DragAndDropTable = ({ items, listId, onDrop, renderItem = null }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Handler para cuando comienza a arrastrar un elemento
  const handleDragStart = (e, item) => {
    // Almacenamos la información del elemento arrastrado
    e.dataTransfer.setData("application/json", JSON.stringify({
      ...item,
      sourceListId: listId
    }));
    
    // Agregamos una clase para estilo
    e.target.classList.add("dragging");
  };

  // Handler para cuando termina de arrastrar
  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
  };

  // Handler para cuando se arrastra sobre este contenedor
  const handleDragOver = (e) => {
    // Previene el comportamiento por defecto que no permitiría soltar
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handler para cuando sale del área de arrastre
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handler para cuando se suelta un elemento en este contenedor
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      // Intentamos obtener los datos del elemento arrastrado
      const data = e.dataTransfer.getData("application/json");
      const droppedItem = JSON.parse(data);
      
      // Verificamos que el elemento venga de otra lista
      if (droppedItem.sourceListId !== listId) {
        // Llamamos al callback onDrop con la fuente, destino y el elemento
        onDrop(droppedItem.sourceListId, listId, droppedItem);
      }
    } catch (error) {
      console.error("Error al procesar el elemento arrastrado:", error);
    }
  };

  return (
    <div 
      className={`drag-drop-list ${isDragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {(!items || items.length === 0) ? (
        <div className="empty-list">
          {listId === "available" ? "No hay miembros disponibles" : "Arrastra miembros aquí"}
        </div>
      ) : (
        items.map((item, index) => (
          <div
            key={`${listId}-${item.email || item.id || index}`}
            className="drag-item"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
          >
            {renderItem ? renderItem(item) : (
              <div className="default-item">{item.name || item.title || "Item"}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DragAndDropTable;