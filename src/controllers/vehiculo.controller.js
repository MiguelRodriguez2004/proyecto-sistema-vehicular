import { crearVehiculoService, listarVehiculosService } from "../services/vehiculo.service.js";

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

export const listarVehiculos = async (req, res) => {
  try {
    const { clienteId } = req.query;
    const vehiculos = await listarVehiculosService({ clienteId });

    res.status(200).json({
      success: true,
      message: "Vehículos obtenidos correctamente",
      data: vehiculos
    });
  } catch (error) {
    console.error("Error al listar vehículos:", error);
    res.status(500).json({
      success: false,
      message: "Error listando vehículos",
      error: error.message
    });
  }
};