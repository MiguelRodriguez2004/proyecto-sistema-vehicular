import { crearVehiculoService } from "../services/vehiculo.service.js";

export const crearVehiculo = async (req, res) => {
  try {
    const vehiculo = await crearVehiculoService(req.body);

    res.status(201).json(vehiculo);
  } catch (error) {
    console.error(error);

    // errores controlados
    if (
      error.message.includes("no existe") ||
      error.message.includes("registrado")
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Error creando vehículo" });
  }
};