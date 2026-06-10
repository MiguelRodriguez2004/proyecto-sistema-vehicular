import express from "express";
import { crearCliente, obtenerClientes } from "../controllers/cliente.controller.js";
import { validarCrearCliente } from "../middlewares/cliente.middleware.js";
import { checkJwt, injectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Proteger todas las rutas de clientes
router.use(checkJwt, injectUser);

router.post("/clientes", validarCrearCliente, crearCliente);
router.get("/clientes", obtenerClientes);

export default router;