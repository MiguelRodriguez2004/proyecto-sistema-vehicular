import express from "express";
import { crearCliente, obtenerClientes } from "../controllers/cliente.controller.js";
import { validarCrearCliente } from "../middlewares/cliente.middleware.js";

const router = express.Router();

router.post("/clientes", validarCrearCliente, crearCliente);
router.get("/clientes", obtenerClientes);

export default router;