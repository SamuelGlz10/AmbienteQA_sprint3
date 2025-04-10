import React from "react";

const DragAndDropTable = ({ requirements, setRequirements, ratings, setRatings }) => {
  const handleDragStart = (e, draggedItem) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(draggedItem));
  };

  const handleDrop = async (e, targetItem) => {
    e.preventDefault();
    const draggedItem = JSON.parse(e.dataTransfer.getData("text/plain"));
  
    const updatedRequirements = [...requirements];
    const draggedIndex = updatedRequirements.findIndex((req) => req.id === draggedItem.id);
    const targetIndex = updatedRequirements.findIndex((req) => req.id === targetItem.id);
  
    updatedRequirements.splice(draggedIndex, 1);
    updatedRequirements.splice(targetIndex, 0, draggedItem);
  
    setRequirements(updatedRequirements);
  
    try {
      const response = await fetch("http://localhost:5001/projectsFB/updateRequirements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirements: updatedRequirements }),
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar los datos en la API");
      }
  
      console.log("Requerimientos guardados en Firebase");
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Permite que el elemento sea soltado
  };

  const InteractiveStars = ({ requirementId }) => {
    const currentRating = ratings[requirementId] || 0;

    const handleStarClick = async (selectedRating) => {
        const updatedRatings = {
          ...ratings,
          [requirementId]: selectedRating, // Actualiza la valoración para el requerimiento específico
        };
      
        setRatings(updatedRatings);
      
        // Enviar las valoraciones actualizadas al backend
        try {
          const response = await fetch("http://localhost:5001/projectsFB/updateRatings", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ratings: updatedRatings }), // Envía el objeto ratings
          });
      
          if (!response.ok) {
            throw new Error("Error al guardar las valoraciones en la API");
          }
      
          console.log("Valoraciones guardadas en Firebase");
        } catch (error) {
          console.error("Error al guardar las valoraciones:", error);
        }
      };

    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= currentRating ? "filled" : ""}`}
            onClick={() => handleStarClick(star)}
          >
            {star <= currentRating ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Requerimientos</th>
            <th>Valoración</th>
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
              <td>{req.name}</td>
              <td>
                <InteractiveStars requirementId={req.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};

export default DragAndDropTable;