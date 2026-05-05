import express from "express";
import { listarOrdenes } from "../controllers/listarOrden.controller.js";

const router = express.Router();

router.get("/ordenes", listarOrdenes);

export default router;