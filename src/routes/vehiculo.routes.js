import express from "express";
import { crearVehiculo } from "../controllers/vehiculo.controller.js";
import { validarCrearVehiculo } from "../middlewares/vehiculo.middleware.js";

const router = express.Router();

router.post("/vehiculos", validarCrearVehiculo, crearVehiculo);

export default router;