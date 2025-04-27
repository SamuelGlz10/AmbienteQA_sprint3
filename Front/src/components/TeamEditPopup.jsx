import React from "react";
import "../css/Dashboard.css";

const TeamEditPopup = ({
    availableMembers,
    teamMembers,
    selectedMembers,
    handleMemberSelect,
    handleSaveTeam,
    handleCancelTeam,
}) => {
  return (
    <div className="team-edit-popup">
      <div className="team-edit-popup-content">
        <button className="team-edit-popup-close" onClick={handleCancelTeam}>
          ×
        </button>
        <h2 className="team-edit-popup-title">Gestionar Equipo</h2>

        <div className="members-sections">
          <div className="available-members-section">
            <h3>Miembros Disponibles</h3>
            <div className="available-members-list">
              {availableMembers.map((member, index) => (
                <div
                  key={index}
                  className={`available-member-card ${
                    selectedMembers.some((m) => m.email === member.email)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleMemberSelect(member)}
                >
                  <div className="member-profile">{member.initials}</div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="current-team-section">
            <h3>Miembros del Equipo</h3>
            <div className="current-team-list">
              {teamMembers.map((member, index) => (
                <div key={index} className="current-member-card">
                  <div className="member-profile">{member.initials}</div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
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
            onClick={handleSaveTeam}
            disabled={selectedMembers.length === 0}
          >
            Agregar Miembros
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamEditPopup;
