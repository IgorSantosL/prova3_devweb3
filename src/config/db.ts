import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/reserva";
    await mongoose.connect(uri);
    console.log("✅ Conectado ao MongoDB [reserva]");
  } catch (error) {
    console.error("❌ Erro ao conectar:", error);
    process.exit(1);
  }
}