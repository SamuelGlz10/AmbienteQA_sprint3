import React, { createContext, useState } from "react";

export const UserContext = createContext();
// Esto se puede usar para manejar el rol y otras cosas del usuario en toda la aplicación
export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null); // Guardar rol de usuario
  const [userId, setUserId] = useState(null);

  return (
    <UserContext.Provider value={{ role, setRole, userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};
