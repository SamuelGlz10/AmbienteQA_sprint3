import express from "express";
import cors from "cors";
import morgan from "morgan";
import projectsFBRoutes from "./routes/projectsFB.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/api", projectsFBRoutes); // Aplica el prefijo "/api" a las rutas de projectsFB

// Inicia el servidor
const PORT = process.env.BACK_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});