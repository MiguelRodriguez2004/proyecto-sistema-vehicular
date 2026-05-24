import express from "express";
import { crearUsuario } from "../controllers/usuario.controller.js";
import { validarCrearUsuario } from "../middlewares/usuario.middleware.js";

const router = express.Router();

router.post("/usuarios", validarCrearUsuario, crearUsuario);

export default router;