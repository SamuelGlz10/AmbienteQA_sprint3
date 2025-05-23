import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "./ErrorPopup";
import SuccessPopup from "./SuccessPopup";
import "../css/Perfil.css";

function PerfilPopup({ isOpen, onClose, userId }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [previewImage, setPreviewImage] = useState(
    localStorage.getItem("profileImage") || "/default-profile.png"
  );
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        const userResponse = await fetch(`${BACKEND_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.status === 403) {
          setErrorMessage("No tienes permiso para acceder a estos datos.");
          return;
        }

        const userData = await userResponse.json();

        if (userData.success) {
          setUserData(userData.user);
          setEditData(userData.user);
          if (userData.user.profileImage) {
            setPreviewImage(userData.user.profileImage);
            localStorage.setItem("profileImage", userData.user.profileImage);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Error al cargar los datos del usuario.");
      }
    };

    fetchUserData();
  }, [userId, BACKEND_URL, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setEditData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!editData.username || !editData.email || !editData.phone) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("lastname", editData.lastname);
      formData.append("email", editData.email);
      formData.append("phone", editData.phone);

      if (previewImage && previewImage.startsWith("data:image")) {
        const blob = await fetch(previewImage).then((res) => res.blob());
        formData.append("profileImage", blob);
      }

      const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUserData({ ...editData, profileImage: previewImage });
        setIsEditing(false);
        setSuccessMessage("¡Los datos se han actualizado con éxito!");
      } else {
        setErrorMessage(result.message || "Error al actualizar los datos.");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setErrorMessage("Error al actualizar los datos. Por favor, intenta de nuevo.");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setErrorMessage("Todos los campos de contraseña son obligatorios.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }
    console.log("Contraseña cambiada:", passwordData);
    setShowPasswordPopup(false);
    setSuccessMessage("¡La contraseña se ha cambiado con éxito!");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="popup-overlay" onClick={onClose}>
        <div className="perfil-popup-container" onClick={(e) => e.stopPropagation()}>
          <button className="close-popup-button" onClick={onClose}>
            &times;
          </button>
          
          <div className="perfil-content">
            <div className="perfil-left">
              <div className="profile-picture-container">
                <img

                  className="perfil-picture"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
                />
                {isEditing && (
                  <div className="image-upload-container">
                    <label htmlFor="profile-image-upload" className="upload-label">
                      Cambiar imagen
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>

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
                          setEditData(userData);
                          setIsEditing(false);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : userData ? (
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
          </div>
        </div>
      </div>

      {showPasswordPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowPasswordPopup(false)}
        >
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
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

      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </>
  );
}

export default PerfilPopup;