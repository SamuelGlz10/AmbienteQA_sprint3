import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopAppBar from "../components/TopAppBar";
import ErrorPopup from "../components/ErrorPopup"; // Importar el componente de error
import SuccessPopup from "../components/SuccessPopup"; // Importar el componente de éxito
import "../css/Perfil.css";

function Perfil() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Estado para controlar el modo de edición
  const [editData, setEditData] = useState({});
  const [previewImage, setPreviewImage] = useState(""); // Previsualización de la imagen
  const [showPasswordPopup, setShowPasswordPopup] = useState(false); // Estado para el popup de contraseña
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error
  const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito

  const userId = localStorage.getItem("userId"); // Obtener el ID del usuario del almacenamiento local

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve the token from localStorage

        const [userResponse, projectsResponse] = await Promise.all([
          fetch(`http://localhost:5001/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:5001/projectsFB/${userId}/projectAndTitle`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (userResponse.status === 403 || projectsResponse.status === 403) {
          setErrorMessage("No tienes permiso para acceder a estos datos.");
          setLoadingProjects(false);
          return;
        }

        const userData = await userResponse.json();
        const projectsData = await projectsResponse.json();
        console.log("Projects Data:", projectsData);

        if (userData.success) {
          setUserData(userData.user);
          setEditData(userData.user);
        }

        if (projectsData.success) {
          setProjects(projectsData.projects);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Error al cargar los datos del usuario.");
      } finally {
        setLoadingProjects(false); // Cambiar el estado de carga a falso después de la solicitud
      }
    };

    fetchUserData();
  }, [userId]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, ""); // Remover caracteres no numéricos
      if (numericValue.length > 10) return; // Prevenir que el número exceda 10 dígitos
      setEditData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Manejar cambios en la imagen de perfil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result); // Actualizar la previsualización
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar los cambios de información
  const handleSaveChanges = async () => {
    if (!editData.username || !editData.email || !editData.phone) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });

      const result = await response.json();

      if (result.success) {
        setUserData(editData);
        setIsEditing(false);
        setSuccessMessage("¡Los datos se han actualizado con éxito!");
      } else {
        setErrorMessage(result.message || "Error al actualizar los datos.");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setErrorMessage(
        "Error al actualizar los datos. Por favor, intenta de nuevo."
      );
    }
  };

  // Manejar cambios en los campos del popup de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar los cambios de contraseña
  const handleSavePassword = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setErrorMessage("Todos los campos de contraseña son obligatorios."); // Mostrar mensaje de error
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden."); // Mostrar mensaje de error
      return;
    }
    console.log("Contraseña cambiada:", passwordData);
    setShowPasswordPopup(false); // Cerrar el popup
    setSuccessMessage("¡La contraseña se ha cambiado con éxito!"); // Mostrar mensaje de éxito
  };

  return (
    <div className="perfil-container">
      <TopAppBar />
      <div className="perfil-content">
        {/* Lado izquierdo: Foto de perfil y datos del usuario */}
        <div className="perfil-left">
          <img
            src={previewImage}
            alt="Foto de perfil"
            className="perfil-picture"
          />
          <div className="perfil-info">
            {isEditing ? (
              <>
                <label>
                  Nombre:
                  <input
                    autoComplete="off"
                    type="text"
                    name="username"
                    value={editData.username || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Apellido:
                  <input
                    autoComplete="off"
                    type="text"
                    name="lastname"
                    value={editData.lastname || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Correo:
                  <input
                    autoComplete="off"
                    type="email"
                    name="email"
                    value={editData.email || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Teléfono:
                  <input
                    autoComplete="off"
                    type="text"
                    name="phone"
                    value={editData.phone || ""}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="edit-buttons">
                  <button className="save-button" onClick={handleSaveChanges}>
                    Guardar Cambios
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setEditData(userData); // Restablecer los datos a los originales
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : userData ? ( // Verificar si userData no es nulo
              <>
                <h2>
                  {userData.username || "X"} {userData.lastname || ""}
                </h2>
                <p>
                  <strong>Correo:</strong> {userData.email}
                </p>
                <p>
                  <strong>Teléfono:</strong> {userData.phone}
                </p>
                <button
                  className="edit-info-button"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Información
                </button>
              </>
            ) : (
              // Mostrar mensaje de carga si userData es nulo
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div className="spinner"></div>
                <p>Cargando información del usuario...</p>
              </div>
            )}
            <button
              className="change-password-button"
              onClick={() => setShowPasswordPopup(true)}
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Lado derecho: Proyectos */}
        <div className="perfil-right">
          <h2>Proyectos</h2>
          {loadingProjects ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="spinner"></div>
              <p>Cargando proyectos...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="project-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <h3>{project.nombreProyecto}</h3>
                  <p>{project.descripcion}</p>
                  <p>
                    <strong>Rol:</strong>{" "}
                    {project.userTitle || "Sin rol asignado"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No estás asignado a ningún proyecto.</p>
          )}
        </div>
      </div>

      {/* Popup para cambiar contraseña */}
      {showPasswordPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowPasswordPopup(false)}
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar el popup al hacer clic dentro
          >
            <h2>Cambiar Contraseña</h2>
            <label>
              Contraseña Actual:
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </label>
            <label>
              Nueva Contraseña:
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </label>
            <label>
              Confirmar Nueva Contraseña:
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </label>
            <div className="popup-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowPasswordPopup(false)}
              >
                Cancelar
              </button>
              <button className="save-button" onClick={handleSavePassword}>
                Guardar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar popup de error */}
      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage("")} // Cerrar el popup
        />
      )}

      {/* Mostrar popup de éxito */}
      {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setSuccessMessage("")} // Cerrar el popup
        />
      )}
    </div>
  );
}

export default Perfil;
