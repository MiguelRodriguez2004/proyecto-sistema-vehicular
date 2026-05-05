import express from "express";
import { crearCliente } from "../controllers/cliente.controller.js";
import { validarCrearCliente } from "../middlewares/cliente.middleware.js";

const router = express.Router();

router.post("/clientes", validarCrearCliente, crearCliente);

export default router;