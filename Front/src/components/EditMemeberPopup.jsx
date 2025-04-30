import React from "react";

import "../css/Dashboard.css";

const EditMemeberPopup = ({
  editingMember,
  setEditingMember,
  memberAction,
  setMemberAction,
  setTeamMembers,
  setAvailableMembers
}) => {
  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.email === editingMember.email ? editingMember : member
        )
      );
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  const handleConfirmRemove = () => {
    if (editingMember) {
      setTeamMembers((prev) =>
        prev.filter((member) => member.email !== editingMember.email)
      );
      setAvailableMembers((prev) => [...prev, editingMember]);
      setEditingMember(null);
      setMemberAction(null);
    }
  };

  return (
    <div className="edit-member-popup">
      <div className="edit-member-popup-content">
        <button
          className="edit-member-popup-close"
          onClick={() => {
            setEditingMember(null);
            setMemberAction(null);
          }}
        >
          ×
        </button>

        {memberAction === "edit" ? (
          <>
            <h2 className="edit-member-popup-title">Editar Miembro</h2>
            <form onSubmit={handleUpdateMember}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <input
                  type="text"
                  value={editingMember.role}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      role: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editingMember.email}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Iniciales:</label>
                <input
                  type="text"
                  value={editingMember.initials}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      initials: e.target.value,
                    })
                  }
                />
              </div>
              <div className="edit-member-popup-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setMemberAction(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit">Guardar Cambios</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="edit-member-popup-title">Eliminar Miembro</h2>
            <div className="remove-member-confirmation">
              <p>
                ¿Estás seguro que deseas eliminar a {editingMember.name} del
                proyecto?
              </p>
              <p>El miembro será movido a la lista de miembros disponibles.</p>
            </div>
            <div className="edit-member-popup-actions">
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setMemberAction(null);
                }}
              >
                Cancelar
              </button>
              <button type="button" onClick={handleConfirmRemove}>
                Eliminar del Proyecto
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditMemeberPopup;
