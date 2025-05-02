import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedRole = localStorage.getItem("role");

    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedRole) {
      setRole(storedRole);
    }

    setUserLoading(false); // Cambia el estado de carga a falso después de obtener los datos
  }, []);

  return (
    <UserContext.Provider
      value={{ role, setRole, userId, setUserId, userLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};
