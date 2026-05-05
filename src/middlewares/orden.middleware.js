export const validarCrearOrden = (req, res, next) => {
  const { vehiculoId, tecnicoId } = req.body;

  if (!vehiculoId) {
    return res.status(400).json({ error: "vehiculoId es obligatorio" });
  }

  if (!tecnicoId) {
    return res.status(400).json({ error: "tecnicoId es obligatorio" });
  }

  next();
};