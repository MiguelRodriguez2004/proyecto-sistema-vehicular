import express from "express";
import {
  crearOrden,
  listarOrdenes,
  obtenerOrdenPorId,
  cambiarEstadoOrden
} from "../controllers/orden.controller.js";
import {
  validarCrearOrden,
  validarObtenerOrden,
  validarCambiarEstadoOrden
} from "../middlewares/orden.middleware.js";
import { injectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Proteger todas las rutas de órdenes de servicio
router.use(injectUser);

// 🆕 Crear una nueva orden de servicio
router.post("/ordenes", validarCrearOrden, crearOrden);

// 🔍 Listar todas las órdenes de servicio con filtros opcionales
router.get("/ordenes", listarOrdenes);

// 🔍 Obtener el detalle completo de una orden por ID
router.get("/ordenes/:id", validarObtenerOrden, obtenerOrdenPorId);

// ✏️ Actualizar el estado de una orden de servicio
router.patch("/ordenes/:id/estado", validarCambiarEstadoOrden, cambiarEstadoOrden);

export default router;