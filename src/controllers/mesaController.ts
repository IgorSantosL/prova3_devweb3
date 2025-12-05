import { Request, Response } from "express";
import { Mesa } from "../models/Mesa";

// Inicializar mesas (Seed)
export async function setupMesas(req: Request, res: Response) {
  try {
    const count = await Mesa.countDocuments();
    if (count === 0) {
        // Criar 6 mesas de exemplo
        const mesas = [
            { numero: 1, capacidade: 2, localizacao: "Varanda" },
            { numero: 2, capacidade: 4, localizacao: "Salão" },
            { numero: 3, capacidade: 4, localizacao: "Salão" },
            { numero: 4, capacidade: 6, localizacao: "Centro" },
            { numero: 5, capacidade: 2, localizacao: "Canto" },
            { numero: 6, capacidade: 8, localizacao: "Área VIP" },
        ];
        await Mesa.insertMany(mesas);
        return res.json({ message: "Mesas criadas com sucesso!" });
    }
    return res.json({ message: "Mesas já existem." });
  } catch (error) {
    return res.status(500).json(error);
  }
}

export async function listarMesas(req: Request, res: Response) {
  const mesas = await Mesa.find().sort({ numero: 1 });
  res.json(mesas);
}