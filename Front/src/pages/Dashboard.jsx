import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import ErrorPopup from "../components/ErrorPopup"; // Importamos el popup de error
import SuccessPopup from "../components/SuccessPopup"; // Importamos el popup de éxito
import TopAppBar from "../components/TopAppBar";
import "../css/Dashboard.css";

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(UserContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeRequirement, setActiveRequirement] = useState("EP");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTeamPopup, setShowTeamPopup] = useState(false);
  const [error, setError] = useState(null); // Estado para manejar el mensaje de error
  const [successMessage, setSuccessMessage] = useState(null); // Estado para manejar el mensaje de éxito
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([
    {
      name: "Loretta Veiga",
      role: "Product Owner",
      email: "lorettav@softedge.com",
      initials: "LV",
    },
    {
      name: "Andres Quintanar",
      role: "Scrum Master",
      email: "andyqv@softedge.com",
      initials: "AQ",
    },
    {
      name: "Gerardo Leiva",
      role: "Backend Developer",
      email: "gerardo.leiva@softedge.com",
      initials: "GL",
    },
  ]);
  const [availableMembers, setAvailableMembers] = useState([
    {
      name: "Juan Pérez",
      role: "Frontend Developer",
      email: "juan.perez@softedge.com",
      initials: "JP",
    },
    {
      name: "María García",
      role: "UX Designer",
      email: "maria.garcia@softedge.com",
      initials: "MG",
    },
  ]);
  const [editData, setEditData] = useState({
    nombreProyecto: "",
    descripcion: "",
  });
  const [showMemberMenu, setShowMemberMenu] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [memberAction, setMemberAction] = useState(null);

  const requirementTabs = [
    { id: "EP", title: "EP", fullText: "Épicas" },
    { id: "RF", title: "RF", fullText: "Requerimientos funcionales" },
    { id: "RNF", title: "RNF", fullText: "Requerimientos no funcionales" },
    { id: "HU", title: "HU", fullText: "Historias de usuario" },
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/projectsFB/${projectId}`
        );
        if (!response.ok) throw new Error("Failed to fetch project");
        const data = await response.json();
        setProject(data);
        setEditData({
          nombreProyecto: data.nombreProyecto,
          descripcion: data.descripcion,
        });
      } catch (error) {
        setError("Error al cargar el proyecto. Por favor, inténtalo de nuevo."); // Muestra el popup de error
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/projectsFB/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) throw new Error("Failed to update project");

      setProject((prev) => ({
        ...prev,
        ...editData,
      }));
      setIsEditing(false);
      console.log("Project updated successfully");
      setSuccessMessage("Proyecto actualizado exitosamente."); // Muestra el popup de éxito
    } catch (error) {
      console.error("Error updating project:", error);
      setError(
        "Error al actualizar el proyecto. Por favor, inténtalo de nuevo."
      ); // Muestra el popup de error
    }
  };

  const closeErrorPopup = () => {
    setError(null); // Cierra el popup de error
  };

  const closeSuccessPopup = () => {
    setSuccessMessage(null); // Cierra el popup de éxito
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowPopup(true);
  };

  const handleStatCardClick = (requirementType) => {
    setActiveTab("requirements");
    setActiveRequirement(requirementType);
  };

  const handleEditTeam = () => {
    setShowTeamPopup(true);
  };

  const handleMemberSelect = (member) => {
    setSelectedMembers((prev) => {
      if (prev.some((m) => m.email === member.email)) {
        return prev.filter((m) => m.email !== member.email);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSaveTeam = () => {
    setTeamMembers((prev) => [...prev, ...selectedMembers]);
    setAvailableMembers((prev) =>
      prev.filter(
        (member) =>
          !selectedMembers.some((selected) => selected.email === member.email)
      )
    );
    setShowTeamPopup(false);
    setSelectedMembers([]);
  };

  const handleCancelTeam = () => {
    setShowTeamPopup(false);
    setSelectedMembers([]);
  };

  const handleMemberMenuClick = (e, member) => {
    e.stopPropagation();
    setShowMemberMenu(showMemberMenu === member.email ? null : member.email);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setMemberAction("edit");
    setShowMemberMenu(null);
  };

  const handleRemoveMember = (member) => {
    setEditingMember(member);
    setMemberAction("remove");
    setShowMemberMenu(null);
  };

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

  if (loading) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="white-container">
        <TopAppBar />
        <div className="home-container">
          <div className="main-title">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-error">
            <h2>Proyecto no encontrado</h2>
            <button onClick={() => navigate("/home")}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="overview-section">
      <div className="project-header">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.nombreProyecto}
              onChange={(e) =>
                setEditData({ ...editData, nombreProyecto: e.target.value })
              }
              className="edit-input title"
            />
            <textarea
              value={editData.descripcion}
              onChange={(e) =>
                setEditData({ ...editData, descripcion: e.target.value })
              }
              className="edit-input description"
            />
            <div className="edit-actions">
              <button className="save-button" onClick={handleSave}>
                Guardar
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{project.nombreProyecto}</h1>
            <p>{project.descripcion}</p>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Editar Proyecto
            </button>
          </>
        )}
      </div>

      <div className="stats-grid">
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("EP")}
        >
          <h3>Épicas</h3>
          <p className="stat-number">{project.EP?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RF")}
        >
          <h3>Requerimientos Funcionales</h3>
          <p className="stat-number">{project.RF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("RNF")}
        >
          <h3>Requerimientos No Funcionales</h3>
          <p className="stat-number">{project.RNF?.length || 0}</p>
        </div>
        <div
          className="stat-card clickable"
          onClick={() => handleStatCardClick("HU")}
        >
          <h3>Historias de Usuario</h3>
          <p className="stat-number">{project.HU?.length || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderRequirementsTab = () => (
    <div className="requirements-section">
      <div className="requirements-tabs">
        {requirementTabs.map((tab) => (
          <button
            key={tab.id}
            className={`requirement-tab ${
              activeRequirement === tab.id ? "active" : ""
            }`}
            onClick={() => setActiveRequirement(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            <span className="tab-full-text"> - {tab.fullText}</span>
          </button>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {project[activeRequirement]?.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="clickable-row"
              >
                <td>{item.id}</td>
                <td>{item.titulo}</td>
                <td>{item.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && selectedItem && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              ×
            </button>
            <div className="popup-header">
              <h3 className="popup-title">{selectedItem.titulo}</h3>
              <p className="popup-id">
                <strong>ID:</strong> {selectedItem.id}
              </p>
            </div>
            <div className="popup-body">
              <div className="description-section">
                <h4>Descripción:</h4>
                <div className="description-text">{selectedItem.data}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <TopAppBar />
      <div className="main-title">
        <h1>
          {project && project.nombreProyecto
            ? `${project.nombreProyecto} - Dashboard`
            : "Dashboard"}
        </h1>
      </div>
      <div className="dashboard-content">
        <div className="main-dashboard-content">
          <button className="back-button" onClick={() => navigate("/home")}>
            ←
          </button>
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Vista General
            </button>
            <button
              className={`tab-button ${
                activeTab === "requirements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("requirements")}
            >
              Elementos
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "overview"
              ? renderOverviewTab()
              : renderRequirementsTab()}
          </div>
        </div>

        <div className="team-members-container">
          <h2 className="team-members-title">Equipo del Proyecto</h2>
          <div className="team-members-content">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="member-profile">{member.initials}</div>
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                  <div className="member-email">{member.email}</div>
                </div>
                <div className="member-actions">
                  <button
                    className="member-menu-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMemberMenuClick(e, member);
                    }}
                  >
                    ⋮
                  </button>
                  {showMemberMenu === member.email && (
                    <div className="member-menu">
                      <button onClick={() => handleEditMember(member)}>
                        Editar
                      </button>
                      <button onClick={() => handleRemoveMember(member)}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="edit-team-button" onClick={handleEditTeam}>
            Agregar Miembros
          </button>
        </div>
      </div>

      {editingMember && (
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
                  <p>
                    El miembro será movido a la lista de miembros disponibles.
                  </p>
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
      )}

      {showTeamPopup && (
        <div className="team-edit-popup">
          <div className="team-edit-popup-content">
            <button
              className="team-edit-popup-close"
              onClick={handleCancelTeam}
            >
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
      )}
      {/* Popup de error */}
      <ErrorPopup message={error} onClose={closeErrorPopup} />

      {/* Popup de éxito */}
      <SuccessPopup message={successMessage} onClose={closeSuccessPopup} />
    </div>
  );
};

export default Dashboard;
