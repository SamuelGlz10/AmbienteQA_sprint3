import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import indexRoutes from "./routes/index.routes.js";
import loginRoutes from "./routes/login.routes.js";
import registroRoutes from "./routes/registro.routes.js";
import projectsFBRouters from "./routes/projectsFB.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(indexRoutes);
app.use(loginRoutes);
app.use(registroRoutes);
app.use(projectsFBRouters);
app.use(aiRoutes);

app.listen(
  process.env.BACK_PORT,
  console.log(`Server is running on port ${process.env.BACK_PORT}`)
);

