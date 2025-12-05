import { Router } from "express";
import { setupMesas, listarMesas } from "../controllers/mesaController";
import { criarReserva, listarReservas, cancelarReserva, atualizarReserva } from "../controllers/reservaController";

const router = Router();

router.post("/mesas/setup", setupMesas);
router.get("/mesas", listarMesas);

router.post("/reservas", criarReserva);
router.get("/reservas", listarReservas);
router.put("/reservas/:id", atualizarReserva); // Nova rota de edição
router.put("/reservas/:id/cancelar", cancelarReserva);

export default router;