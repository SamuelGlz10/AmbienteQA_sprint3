import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import indexRoutes from "./routes/index.routes.js";
import loginRoutes from "./routes/login.routes.js";
import projectsFBRouters from "./routes/projectsFB.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import projectsFBRoutes from "./routes/projectsFB.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(indexRoutes);
app.use(loginRoutes);
app.use(projectsFBRouters);
app.use(aiRoutes);
// Rutas
app.use(projectsFBRoutes);

// Inicia el servidor
const PORT = process.env.BACK_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
