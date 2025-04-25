import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const { exp } = JSON.parse(atob(token.split(".")[1])); // Decodificar el token JWT
    return Date.now() < exp * 1000; // Checar si el token no ha expirado
  });

  // Guardar el estado de isLogin en el almacenamiento local, y manejar el tiempo de expiración del token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const timeout = exp * 1000 - Date.now();

      if (timeout > 0) {
        const timer = setTimeout(() => {
          setIsLogin(false);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
        }, timeout);

        return () => clearTimeout(timer);
      } else {
        setIsLogin(false);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
      }
    }
  }, [isLogin]);

  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
