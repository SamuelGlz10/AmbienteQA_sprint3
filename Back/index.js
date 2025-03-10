
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import indexRoutes from "./routes/index.routes.js";

const app = express();



app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/", indexRoutes);

app.listen(process.env.BACK_PORT, console.log(`Server is running on port ${process.env.BACK_PORT}`));