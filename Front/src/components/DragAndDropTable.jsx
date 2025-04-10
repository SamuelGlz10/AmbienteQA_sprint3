import React from "react";

const DragAndDropTable = ({ requirements, setRequirements, activeTab, updateBackend }) => {
  const handleDragStart = (e, draggedItem) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(draggedItem));
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    const draggedItem = JSON.parse(e.dataTransfer.getData("text/plain"));

    if (draggedItem.id === targetItem.id) return;

    const updatedRequirements = [...requirements];
    const draggedIndex = updatedRequirements.findIndex((req) => req.id === draggedItem.id);
    const targetIndex = updatedRequirements.findIndex((req) => req.id === targetItem.id);

    // Reorganizar los elementos
    updatedRequirements.splice(draggedIndex, 1);
    updatedRequirements.splice(targetIndex, 0, draggedItem);

    // Actualizar el estado local
    setRequirements(updatedRequirements);

    // Actualizar el backend con los cambios
    updateBackend(activeTab, updatedRequirements);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Permite que el elemento sea soltado
  };

  return (
    <div className="drag-and-drop-table">
      <table>
        <thead>
          <tr>
            <th>Requerimientos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => (
            <tr
              key={req.id}
              draggable
              onDragStart={(e) => handleDragStart(e, req)}
              onDrop={(e) => handleDrop(e, req)}
              onDragOver={handleDragOver}
              style={{ cursor: "grab" }}
            >
              <td>{req.titulo}</td>
              <td>{req.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DragAndDropTable;