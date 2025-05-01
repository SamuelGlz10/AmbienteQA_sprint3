import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Perfil.css"; 
import TopAppBar from "../components/TopAppBar";
import ErrorPopup from "../components/ErrorPopup"; // Importar el componente de error
import SuccessPopup from "../components/SuccessPopup"; // Importar el componente de éxito

function Perfil() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: "Andrés",
    lastName: "Quintanar",
    email: "a00836727@tec.mx",
    phone: "8119797902", 
    profilePicture: "/profile-picture.png", 
  });

  const [projects] = useState([
    {
      id: "proj01",
      nombreProyecto: "Sistema Hotelero",
      descripcion: "Descripción del Proyecto 1",
      rol: "Scrum Master", // Rol del usuario en el proyecto
    },
    {
      id: "proj02",
      nombreProyecto: "Proyecto 2",
      descripcion: "Descripción del Proyecto 2",
      rol: "Scrum Team", // Rol del usuario en el proyecto
    },
    {
      id: "proj03",
      nombreProyecto: "Proyecto 3",
      descripcion: "Descripción del Proyecto 3",
      rol: "Product Owner", // Rol del usuario en el proyecto
    },
  ]);

  const [isEditing, setIsEditing] = useState(false); // Estado para controlar el modo de edición
  const [editData, setEditData] = useState({ ...userData });
  const [previewImage, setPreviewImage] = useState(userData.profilePicture); // Previsualización de la imagen

  const [showPasswordPopup, setShowPasswordPopup] = useState(false); // Estado para el popup de contraseña
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error
  const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
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
  const handleSaveChanges = () => {
    if (!editData.firstName || !editData.lastName || !editData.email || !editData.phone) {
      setErrorMessage("Todos los campos son obligatorios."); // Mostrar mensaje de error
      return;
    }
    setUserData({ ...editData, profilePicture: previewImage }); // Actualizar los datos del usuario
    setIsEditing(false); // Salir del modo de edición
    setSuccessMessage("¡Los datos se han actualizado con éxito!"); // Mostrar mensaje de éxito
  };

  // Manejar cambios en los campos del popup de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar los cambios de contraseña
  const handleSavePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
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
                  Cambiar Foto de Perfil:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <label>
                  Nombre:
                  <input
                    type="text"
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Apellido:
                  <input
                    type="text"
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Correo:
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Teléfono:
                  <input
                    type="text"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                  />
                </label>
                <div className="edit-buttons">
                  <button
                    className="save-button"
                    onClick={handleSaveChanges}
                  >
                    Guardar Cambios
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
                <h2>{userData.firstName} {userData.lastName}</h2>
                <p><strong>Correo:</strong> {userData.email}</p>
                <p><strong>Teléfono:</strong> {userData.phone}</p>
                <button
                  className="edit-info-button"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Información
                </button>
              </>
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
          {projects.length > 0 ? (
            <div className="project-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <h3>{project.nombreProyecto}</h3>
                  <p>{project.descripcion}</p>
                  <p><strong>Rol:</strong> {project.rol}</p> {/* Mostrar el rol del usuario */}
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
        <div className="popup-overlay" onClick={() => setShowPasswordPopup(false)}>
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