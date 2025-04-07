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
app.use(projectsFBRoutes);

// Inicia el servidor
const PORT = process.env.BACK_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});