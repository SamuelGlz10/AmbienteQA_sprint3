import React, { useState, useEffect } from "react";
import DragAndDropTable from "./DragAndDropTable";
import "../css/Dashboard.css";
import "../css/DragAndDropTable.css";

const TeamEditPopup = ({
  availableMembers,
  teamMembers,
  handleSaveTeam,
  handleCancelTeam,
  setError,
}) => {
  // Aseguramos que los miembros tengan identificadores únicos
  const formatMembers = (members) => {
    return members.map((member) => ({
      ...member,
      // Aseguramos que cada miembro tenga un ID único si no lo tiene
      id:
        member.id ||
        member.email ||
        `member-${Math.random().toString(36).substr(2, 9)}`,
    }));
  };

  // Estado para manejar las listas de miembros para el DragAndDropTable
  const [availableList, setAvailableList] = useState(() =>
    formatMembers(availableMembers || [])
  );

  const [teamList, setTeamList] = useState(() => {
    return formatMembers(teamMembers || []);
  });

  const currentUserId = Number(localStorage.getItem("userId"));

  // Estado para seguir los miembros que se han movido (añadidos y eliminados)
  const [addedMembers, setAddedMembers] = useState([]);
  const [removedMembers, setRemovedMembers] = useState([]);

  // Estados para manejar la búsqueda en las listas
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchTeam, setSearchTeam] = useState("");

  // Actualizamos las listas cuando cambian las props
  useEffect(() => {
    setAvailableList(formatMembers(availableMembers || []));
    setTeamList(formatMembers(teamMembers || []));
    setAddedMembers([]);
    setRemovedMembers([]);
  }, [availableMembers, teamMembers]);

  // Función para manejar el drag and drop entre las listas
  const handleDrop = (source, destination, item) => {
    console.log(`Moviendo de ${source} a ${destination}:`, item);
    console.log(item.id, currentUserId);

    if (item.id === currentUserId) {
      setError("No puedes eliminarte a ti mismo del equipo.");
      return;
    }

    if (source === "available" && destination === "team") {
      // Buscamos el miembro en la lista de disponibles
      const memberToAdd = availableList.find((m) => m.email === item.email);
      if (memberToAdd) {
        // Actualizamos las listas
        setTeamList((prev) => [...prev, memberToAdd]);
        setAvailableList((prev) => prev.filter((m) => m.email !== item.email));

        // Registramos el miembro como añadido
        if (!teamMembers.some((m) => m.email === memberToAdd.email)) {
          setAddedMembers((prev) => [...prev, memberToAdd]);
        }

        // Si estaba en la lista de eliminados, lo quitamos
        setRemovedMembers((prev) =>
          prev.filter((m) => m.email !== memberToAdd.email)
        );
      }
    } else if (source === "team" && destination === "available") {
      // Buscamos el miembro en la lista de equipo
      const memberToRemove = teamList.find((m) => m.email === item.email);

      if (memberToRemove) {
        // Actualizamos las listas
        setTeamList((prev) => prev.filter((m) => m.email !== item.email));
        setAvailableList((prev) => [...prev, memberToRemove]);

        // Si es un miembro original del equipo, lo registramos como eliminado
        if (teamMembers.some((m) => m.email === item.email)) {
          setRemovedMembers((prev) => [...prev, memberToRemove]);
        }

        // Si estaba en la lista de añadidos, lo quitamos
        setAddedMembers((prev) =>
          prev.filter((m) => m.email !== memberToRemove.email)
        );
      }
    }
  };

  // Función para guardar los cambios
  const handleSave = () => {
    // Llamamos directamente con los arrays de añadidos y eliminados
    handleSaveTeam(addedMembers, removedMembers);
  };

  // Verificamos si hay cambios para habilitar/deshabilitar el botón de guardar
  const hasChanges = addedMembers.length > 0 || removedMembers.length > 0;

  // Estados para manejar la búsqueda en las listas
  const filteredAvailableList = availableList.filter(
    (member) =>
      member.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
      member.email.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  // Estado para manejar la búsqueda en la lista de equipo
  const filteredTeamList = teamList.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTeam.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTeam.toLowerCase())
  );

  return (
    <div
      className="team-edit-popup-overlay"
      onClick={handleCancelTeam}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="team-edit-popup">
        <div
          className="team-edit-popup-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="team-edit-popup-close" onClick={handleCancelTeam}>
            ×
          </button>
          <h2 className="team-edit-popup-title">Gestionar Equipo</h2>

          <div className="drag-drop-container">
            <div className="drag-drop-section">
              <h3>Miembros Disponibles</h3>
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Buscar miembros disponibles..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="search-bar"
                />
                {searchAvailable && (
                  <button
                    className="clear-search-button"
                    onClick={() => setSearchAvailable("")}
                  >
                    ×
                  </button>
                )}
              </div>
              <DragAndDropTable
                items={filteredAvailableList}
                listId="available"
                onDrop={handleDrop}
                renderItem={(item) => (
                  <div
                    className={`member-card ${
                      removedMembers.some((m) => m.email === item.email)
                        ? "removed-member"
                        : ""
                    }`}
                  >
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
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Buscar miembros del equipo..."
                  value={searchTeam}
                  onChange={(e) => setSearchTeam(e.target.value)}
                  className="search-bar"
                />
                {searchTeam && (
                  <button
                    className="clear-search-button"
                    onClick={() => setSearchTeam("")}
                  >
                    ×
                  </button>
                )}
              </div>
              <DragAndDropTable
                items={filteredTeamList}
                listId="team"
                onDrop={handleDrop}
                renderItem={(item) => (
                  <div
                    className={`member-card ${
                      addedMembers.some((m) => m.email === item.email)
                        ? "new-member"
                        : ""
                    }`}
                    draggable={item.id !== currentUserId}
                  >
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

          <div className="popup-footer">
            <button
              className="popup-button secondary"
              onClick={handleCancelTeam}
            >
              Cancelar
            </button>
            <button
              className="popup-button primary"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamEditPopup;
