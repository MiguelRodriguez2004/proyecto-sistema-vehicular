import express from "express";
import { crearNovedad, obtenerNovedadesPorOrden } from "../controllers/novedad.controller.js";
import { validarCrearNovedad } from "../middlewares/novedad.middleware.js";

const router = express.Router();

router.post("/novedades", validarCrearNovedad, crearNovedad);
router.get("/novedades", obtenerNovedadesPorOrden);

export default router;