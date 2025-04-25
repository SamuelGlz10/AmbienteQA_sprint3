import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/index.css";

const TopAppBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  const navigate = useNavigate();

  const tabs = ["Perfil", "Configuraciones", "Cerrar Sesión"];

  const profilePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/login"); // Redirige al login después de cerrar sesión
  };

  const handleClick = (tab) => {
    switch (tab) {
      case "Perfil":
        navigate("/profile"); // Navigate to the profile page
        break;
      case "Configuraciones":
        navigate("/settings"); // Navigate to the settings page
        break;
      case "Cerrar Sesión":
        handleLogout(); // Call the logout function
        break;
      default:
        console.log(`No action defined for ${tab}`);
    }
  };

  useEffect(() => {
    // Cerrar el popup al hacer clic fuera de él
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="logo-container">
      <img
        src="/softedge_logo2.png"
        alt="SoftEdge Logo"
        className="softedge-logo"
      />
      <div className="profile-container" onClick={profilePopup}></div>
      {isOpen && (
        <div className="profile-popup" ref={popupRef}>
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="profile-popup-tab"
              onClick={() => handleClick(tab)}
            >
              <p>{tab}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopAppBar;
