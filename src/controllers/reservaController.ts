import { Request, Response } from "express";
import { Reserva } from "../models/Reserva";
import { Mesa } from "../models/Mesa";

// Atualiza status baseado no tempo (Lógica vital para o mapa funcionar)
async function atualizarStatusAutomatico() {
    const reservas = await Reserva.find({ status: { $ne: 'cancelado' } });
    const agora = new Date();

    const updates = reservas.map(async (reserva) => {
        const inicio = new Date(reserva.dataHora);
        const fim = new Date(inicio.getTime() + 90 * 60000); // 1h30 duração

        let novoStatus = reserva.status;

        if (agora > fim) novoStatus = 'finalizado';
        else if (agora >= inicio && agora < fim) novoStatus = 'ocupado';
        else novoStatus = 'reservado';

        if (reserva.status !== novoStatus && reserva.status !== 'finalizado') {
            reserva.status = novoStatus as any;
            await reserva.save();
        }
    });
    await Promise.all(updates);
}

export async function listarReservas(req: Request, res: Response) {
    try {
        await atualizarStatusAutomatico(); // Garante dados frescos

        // Filtros recebidos da URL (Query Params)
        const { data, status, mesa } = req.query;
        const filtro: any = {};

        // Se o usuário mandou filtro, adicionamos ao objeto de busca
        if (status) filtro.status = status;
        if (mesa) {
             // Precisamos buscar o ID da mesa baseado no numero, ou filtrar no populate (mais complexo).
             // Para simplificar na prova: filtramos no javascript ou assumimos que o front manda o ID.
             // Vamos filtrar pelo ID da mesa se vier
             filtro.mesaId = mesa; 
        }
        
        // Busca data específica (começo e fim do dia)
        if (data) {
            const inicioDia = new Date(data as string);
            const fimDia = new Date(data as string);
            fimDia.setHours(23, 59, 59);
            filtro.dataHora = { $gte: inicioDia, $lte: fimDia };
        }

        const reservas = await Reserva.find(filtro).populate("mesaId").sort({ dataHora: 1 });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar", error });
    }
}

export async function criarReserva(req: Request, res: Response) {
    try {
        const { nomeCliente, contatoCliente, mesaId, qtdPessoas, dataHora } = req.body;
        
        // Validações básicas
        const dataReserva = new Date(dataHora);
        const agora = new Date();
        const mesa = await Mesa.findById(mesaId);

        if (!mesa) return res.status(404).json({ message: "Mesa não existe" });
        if (mesa.capacidade < qtdPessoas) return res.status(400).json({ message: "Capacidade excedida" });
        if (dataReserva < new Date(agora.getTime() + 60 * 60 * 1000)) {
            return res.status(400).json({ message: "Antecedência mínima de 1h necessária." });
        }

        // Verifica conflito de horário (1h30 janela)
        const fimReserva = new Date(dataReserva.getTime() + 90 * 60000);
        const conflito = await Reserva.findOne({
            mesaId,
            status: { $nin: ['cancelado', 'finalizado'] },
            $or: [
                { dataHora: { $lt: fimReserva, $gte: dataReserva } },
                { dataHora: { $lt: dataReserva, $gt: new Date(dataReserva.getTime() - 90*60000) } }
            ]
        });

        if (conflito) return res.status(400).json({ message: "Mesa ocupada neste horário." });

        const nova = await Reserva.create(req.body);
        res.status(201).json(nova);
    } catch (error) {
        res.status(400).json(error);
    }
}

// EDITAR RESERVA (Novo Requisito)
export async function atualizarReserva(req: Request, res: Response) {
    try {
        const { id } = req.params;
        // Na prova, validações complexas de edição podem ser simplificadas
        const atualizada = await Reserva.findByIdAndUpdate(id, req.body, { new: true });
        res.json(atualizada);
    } catch (error) {
        res.status(500).json(error);
    }
}

export async function cancelarReserva(req: Request, res: Response) {
    await Reserva.findByIdAndUpdate(req.params.id, { status: "cancelado" });
    res.json({ message: "Cancelado" });
}