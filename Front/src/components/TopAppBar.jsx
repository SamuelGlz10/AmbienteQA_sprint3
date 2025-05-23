import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PerfilPopup from "./PerfilPopup";
import "../css/index.css";

const TopAppBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false); // Estado para el popup de perfil
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const tabs = [
    { name: "Perfil", icon: "person" },
    { name: "Configuraciones", icon: "settings" },
    { name: "Biométricos", icon: "favorite" },
    { name: "Cerrar Sesión", icon: "logout" }
  ];

  const profilePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleClick = (tab) => {
    switch (tab.name) {
      case "Perfil":
        setShowProfilePopup(true); // Abre el popup de perfil
        setIsOpen(false); // Cierra el menú desplegable
        break;
      case "Configuraciones":
        navigate("/settings");
        break;
      case "Biométricos":
        navigate("/biometricos");
        break;
      case "Cerrar Sesión":
        handleLogout();
        break;
      default:
        console.log(`No action defined for ${tab.name}`);
    }
  };

  useEffect(() => {
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
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <img
              src="/softedge_logo2.png"
              alt="SoftEdge Logo"
              className="navbar-logo"
              onClick={() => navigate("/home")}
            />
          </div>
          
          <div className="navbar-right">
            <button className="home-button" onClick={() => navigate("/home")}>
              <span className="material-icons">home</span>
            </button>
            <div className="profile-container" onClick={profilePopup}>
              <div className="profile-avatar">
                <span className="material-icons profile-icon">person</span>
              </div>
            </div>
            
            {isOpen && (
              <div className="profile-popup" ref={popupRef}>
                {tabs.map((tab, index) => (
                  <div
                    key={index}
                    className="profile-popup-tab"
                    onClick={() => handleClick(tab)}
                  >
                    <span className="material-icons tab-icon">{tab.icon}</span>
                    <span className="tab-text">{tab.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Componente PerfilPopup */}
      <PerfilPopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        userId={userId}
      />
    </>
  );
};

export default TopAppBar;