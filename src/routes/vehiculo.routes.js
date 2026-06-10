import express from "express";
import { crearVehiculo, listarVehiculos } from "../controllers/vehiculo.controller.js";
import { validarCrearVehiculo } from "../middlewares/vehiculo.middleware.js";
import { checkJwt, injectUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Proteger todas las rutas de vehículos
router.use(checkJwt, injectUser);

router.post("/vehiculos", validarCrearVehiculo, crearVehiculo);
router.get("/vehiculos", listarVehiculos);

export default router;