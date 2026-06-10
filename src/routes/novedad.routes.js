import express from "express";
import { crearNovedad, obtenerNovedadesPorOrden } from "../controllers/novedad.controller.js";
import { validarCrearNovedad } from "../middlewares/novedad.middleware.js";
import { checkJwt, injectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Proteger todas las rutas de novedades
router.use(checkJwt, injectUser);

router.post("/novedades", validarCrearNovedad, crearNovedad);
router.get("/novedades", obtenerNovedadesPorOrden);

export default router;