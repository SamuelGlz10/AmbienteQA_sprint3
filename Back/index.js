import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import indexRoutes from "./routes/index.routes.js";
import loginRoutes from "./routes/login.routes.js";
import registroRoutes from "./routes/registro.routes.js";
import projectsFBRouters from "./routes/projectsFB.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

const allowedOrigins = [`http://localhost:5173`, "https://softedge.vercel.app"];

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

app.use(indexRoutes);
app.use(loginRoutes);
app.use(registroRoutes);
app.use(projectsFBRouters);
app.use(aiRoutes);

// Development only: (comentar para produccion)
const PORT = process.env.BACK_PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
