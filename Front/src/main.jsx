import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./components/AuthContext"; // Contexto de autenticacion para isLogin
import { UserProvider } from "./components/UserContext"; // Contexto de usuario para userId y role

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </AuthProvider>
  </StrictMode>
);