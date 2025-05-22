import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import projectsFBRouters from "./routes/projectsFB.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";
import dialogflowRoutes from "./routes/dialogflow.routes.js";

const app = express();

const allowedOrigins = [
  `http://localhost:5173`,
  "https://developer-dashboard.whoop.com",
  "https://soft-edge-two.vercel.app",
  "https://dialogflow.cloud.google.com",
  "https://extensions.aitopia.ai",
];

// Middleware para eliminar barras diagonales dobles en la URL
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, "/");
  next();
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use(authRoutes);
app.use(userRoutes); // Agregar la ruta de usuarios
app.use(projectsFBRouters);
app.use(aiRoutes);
app.use(dialogflowRoutes);

// Development only: (comentar para produccion)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.BACK_PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
