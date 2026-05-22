import { cambiarEstadoOrdenService } from "../services/cambiarEstadoOrden.service.js";

export const cambiarEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const orden = await cambiarEstadoOrdenService(id, estado);

    res.json(orden);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error actualizando estado" });
  }
};