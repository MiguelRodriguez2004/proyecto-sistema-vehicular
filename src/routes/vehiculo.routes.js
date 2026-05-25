import express from "express";
import { crearVehiculo, listarVehiculos } from "../controllers/vehiculo.controller.js";
import { validarCrearVehiculo } from "../middlewares/vehiculo.middleware.js";

const router = express.Router();

router.post("/vehiculos", validarCrearVehiculo, crearVehiculo);
router.get("/vehiculos", listarVehiculos);

export default router;