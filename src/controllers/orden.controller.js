import { crearOrdenService } from "../services/orden.service.js";

export const crearOrden = async (req, res) => {
  try {
    const orden = await crearOrdenService(req.body);

    res.status(201).json(orden);
  } catch (error) {
    console.error(error);

    if (
      error.message.includes("no existe") ||
      error.message.includes("no es válido")
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Error creando la orden" });
  }
};