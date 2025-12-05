import { Schema, model, Document } from "mongoose";

export interface IReserva extends Document {
  nomeCliente: string;
  contatoCliente: string;
  mesaId: Schema.Types.ObjectId; // Referência à mesa
  qtdPessoas: number;
  dataHora: Date;
  status: "reservado" | "ocupado" | "finalizado" | "cancelado";
  observacoes?: string;
}

const ReservaSchema = new Schema({
  nomeCliente: { type: String, required: true },
  contatoCliente: { type: String, required: true },
  mesaId: { type: Schema.Types.ObjectId, ref: "Mesa", required: true },
  qtdPessoas: { type: Number, required: true },
  dataHora: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["reservado", "ocupado", "finalizado", "cancelado"], 
    default: "reservado" 
  },
  observacoes: { type: String }
});

export const Reserva = model<IReserva>("Reserva", ReservaSchema);