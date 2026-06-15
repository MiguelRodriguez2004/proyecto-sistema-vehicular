import express from "express";
import { crearUsuario, obtenerPerfil, actualizarPerfil } from "../controllers/usuario.controller.js";
import { validarCrearUsuario } from "../middlewares/usuario.middleware.js";
import { injectUser, requireRol } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas del perfil del usuario autenticado (deben ir ANTES de rutas con parámetros dinámicos)
router.get("/usuarios/me", injectUser, obtenerPerfil);
router.patch("/usuarios/me", injectUser, actualizarPerfil);

// Crear un nuevo usuario (solo administradores)
router.post("/usuarios", injectUser, requireRol(["ADMIN"]), validarCrearUsuario, crearUsuario);

export default router;