import express from "express";
import { cambiarEstadoOrden } from "../controllers/cambiarEstadoOrden.controller.js";

const router = express.Router();

router.patch("/ordenes/:id/estado", cambiarEstadoOrden);

export default router;