import express from "express";
import cors from "cors";
import path from "path";
import apiRoutes from "./routes/api";

const app = express();

app.use(cors());
app.use(express.json());

// Servir frontend
app.use(express.static(path.join(__dirname, "../public")));

// Rotas API
app.use("/api", apiRoutes);

export default app;