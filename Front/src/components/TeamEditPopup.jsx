import React, { useState, useEffect } from "react";
import DragAndDropTable from "./DragAndDropTable";
import "../css/Dashboard.css";
import "../css/DragAndDropTable.css";

const TeamEditPopup = ({
  availableMembers,
  teamMembers,
  handleSaveTeam,
  handleCancelTeam,
  }) => {
  // Aseguramos que los miembros tengan identificadores únicos
  const formatMembers = (members) => {
    return members.map(member => ({
      ...member,
      // Aseguramos que cada miembro tenga un ID único si no lo tiene
      id: member.id || member.email || `member-${Math.random().toString(36).substr(2, 9)}`,
    }));
  };

  // Estado para manejar las listas de miembros para el DragAndDropTable
  const [availableList, setAvailableList] = useState(() => {
    const formattedAvailable = formatMembers(availableMembers || []);
    return formattedAvailable.filter(
      m => !teamMembers.some(tm => tm.email === m.email)
    );
  });
  
  const [teamList, setTeamList] = useState(() => {
    return formatMembers(teamMembers || []);
  });

  // Estado para seguir los miembros que se han movido (añadidos y eliminados)
  const [addedMembers, setAddedMembers] = useState([]);
  const [removedMembers, setRemovedMembers] = useState([]);

  // Actualizamos las listas cuando cambian las props
  useEffect(() => {
    const formattedAvailable = formatMembers(availableMembers || []);
    setAvailableList(
      formattedAvailable.filter(m => !teamMembers.some(tm => tm.email === m.email))
    );
    setTeamList(formatMembers(teamMembers || []));
    setAddedMembers([]);
    setRemovedMembers([]);
  }, [availableMembers, teamMembers]);

  // Función para manejar el drag and drop entre las listas
  const handleDrop = (source, destination, item) => {
    console.log(`Moviendo de ${source} a ${destination}:`, item);
    
    if (source === "available" && destination === "team") {
      // Buscamos el miembro en la lista de disponibles
      const memberToAdd = availableList.find(m => m.email === item.email);
      if (memberToAdd) {
        // Actualizamos las listas
        setTeamList(prev => [...prev, memberToAdd]);
        setAvailableList(prev => prev.filter(m => m.email !== item.email));
        
        // Registramos el miembro como añadido
        setAddedMembers(prev => [...prev, memberToAdd]);
        
        // Si estaba en la lista de eliminados, lo quitamos
        setRemovedMembers(prev => prev.filter(m => m.email !== memberToAdd.email));
      }
    } else if (source === "team" && destination === "available") {
      // Buscamos el miembro en la lista de equipo
      const memberToRemove = teamList.find(m => m.email === item.email);
      
      if (memberToRemove) {
        // Actualizamos las listas
        setTeamList(prev => prev.filter(m => m.email !== item.email));
        setAvailableList(prev => [...prev, memberToRemove]);
        
        // Si es un miembro original del equipo, lo registramos como eliminado
        if (teamMembers.some(m => m.email === item.email)) {
          setRemovedMembers(prev => [...prev, memberToRemove]);
        }
        
        // Si estaba en la lista de añadidos, lo quitamos
        setAddedMembers(prev => prev.filter(m => m.email !== memberToRemove.email));
      }
    }
  };

  // Función para guardar los cambios
  // Función para guardar los cambios
  const handleSave = () => {
    // Llamamos directamente con los arrays de añadidos y eliminados
   handleSaveTeam(addedMembers, removedMembers);
  };

  // Verificamos si hay cambios para habilitar/deshabilitar el botón de guardar
  const hasChanges = addedMembers.length > 0 || removedMembers.length > 0;

  return (
    <div className="team-edit-popup">
      <div className="team-edit-popup-content">
        <button className="team-edit-popup-close" onClick={handleCancelTeam}>
          ×
        </button>
        <h2 className="team-edit-popup-title">Gestionar Equipo</h2>

        <div className="drag-drop-container">
          <div className="drag-drop-section">
            <h3>Miembros Disponibles</h3>
            <DragAndDropTable
              items={availableList}
              listId="available"
              onDrop={handleDrop}
              renderItem={(item) => (
                <div className={`member-card ${removedMembers.some(m => m.email === item.email) ? "removed-member" : ""}`}>
                  <div className="member-profile">{item.initials}</div>
                  <div className="member-info">
                    <div className="member-name">
                      {item.name + " " + (item.lastname || "")}
                    </div>
                    <div className="member-role">{item.role}</div>
                    <div className="member-email">{item.email}</div>
                  </div>
                </div>
              )}
            />
          </div>

          <div className="drag-drop-section">
            <h3>Miembros del Equipo</h3>
            <DragAndDropTable
              items={teamList}
              listId="team"
              onDrop={handleDrop}
              renderItem={(item) => (
                <div className={`member-card ${addedMembers.some(m => m.email === item.email) ? "new-member" : ""}`}>
                  <div className="member-profile">{item.initials}</div>
                  <div className="member-info">
                    <div className="member-name">
                      {item.name + " " + (item.lastname || "")}
                    </div>
                    <div className="member-role">{item.role}</div>
                    <div className="member-email">{item.email}</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        <div className="team-edit-popup-actions">
          <button
            className="team-edit-popup-button cancel"
            onClick={handleCancelTeam}
          >
            Cancelar
          </button>
          <button
            className="team-edit-popup-button save"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamEditPopup;
