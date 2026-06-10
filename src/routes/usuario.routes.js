import express from "express";
import { crearUsuario } from "../controllers/usuario.controller.js";
import { validarCrearUsuario } from "../middlewares/usuario.middleware.js";
import { checkJwt, injectUser, requireRol } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/usuarios", checkJwt, injectUser, requireRol(["ADMIN"]), validarCrearUsuario, crearUsuario);

export default router;