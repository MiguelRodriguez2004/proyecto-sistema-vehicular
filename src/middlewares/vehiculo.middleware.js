export const validarCrearVehiculo = (req, res, next) => {
  const { placa, tipo, clienteId } = req.body;

  if (!placa || placa.trim() === "") {
    return res.status(400).json({ error: "La placa es obligatoria" });
  }

  if (!tipo || !["AUTO", "MOTO"].includes(tipo)) {
    return res.status(400).json({ error: "Tipo inválido (AUTO o MOTO)" });
  }

  if (!clienteId || isNaN(clienteId)) {
    return res.status(400).json({
      error: "clienteId es obligatorio y debe ser numérico"
    });
  }

  next();
};