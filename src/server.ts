import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";

dotenv.config();
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        // Tenta criar as mesas automaticamente ao iniciar
        fetch(`http://localhost:${PORT}/api/mesas/setup`, { method: "POST" }).catch(() => {});
    });
});