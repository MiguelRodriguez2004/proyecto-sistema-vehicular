import { listarOrdenesService } from "../services/listarOrden.service.js";

export const listarOrdenes = async (req, res) => {
  try {
    const ordenes = await listarOrdenesService(req.query);
    res.json(ordenes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listando órdenes" });
  }
};