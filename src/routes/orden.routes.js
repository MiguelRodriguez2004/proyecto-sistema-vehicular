import express from "express";
import { crearOrden } from "../controllers/orden.controller.js";
import { validarCrearOrden } from "../middlewares/orden.middleware.js";

const router = express.Router();

router.post("/ordenes", validarCrearOrden, crearOrden);

export default router;