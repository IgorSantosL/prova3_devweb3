import { Schema, model, Document } from "mongoose";

export interface IMesa extends Document {
  numero: number;
  capacidade: number;
  localizacao: string;
}

const MesaSchema = new Schema({
  numero: { type: Number, required: true, unique: true },
  capacidade: { type: Number, required: true },
  localizacao: { type: String, required: true }
});

export const Mesa = model<IMesa>("Mesa", MesaSchema);