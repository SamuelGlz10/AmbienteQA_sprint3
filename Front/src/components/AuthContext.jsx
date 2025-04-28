import React, { createContext, useState, useEffect } from "react";
import ErrorPopup from "./ErrorPopup";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const { exp } = JSON.parse(atob(token.split(".")[1])); // Decodificar el token JWT
    return Date.now() < exp * 1000; // Checar si el token no ha expirado
  });

  const [error, setError] = useState(null); // Estado para manejar el mensaje de error

  // Guardar el estado de isLogin en el almacenamiento local, y manejar el tiempo de expiración del token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const timeout = exp * 1000 - Date.now();

      if (timeout > 0) {
        const timer = setTimeout(() => {
          setError(
            "El token ha expirado. Por favor, inicia sesión nuevamente."
          );
          localStorage.removeItem("token"); // Eliminar el token del almacenamiento local
          localStorage.removeItem("userId"); // Eliminar el ID de usuario del almacenamiento local
          localStorage.removeItem("role"); // Eliminar el rol del almacenamiento local
          setIsLogin(false);
        }, timeout);

        return () => clearTimeout(timer);
      } else {
        setError("El token ha expirado. Por favor, inicia sesión nuevamente.");
        setIsLogin(false);
      }
    }
  }, [isLogin]);

  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin }}>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}{" "}
      {/* Mostrar el popup de error */}
      {children}
    </AuthContext.Provider>
  );
};
