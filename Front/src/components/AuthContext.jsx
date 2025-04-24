import React, { createContext, useState } from "react";

export const AuthContext = createContext();
// Permite manejar el estado de autenticación en toda la aplicación
export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
