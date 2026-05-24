import { ERROR_MESSAGES, TIPO_VEHICULO } from "../constants/index.js";

export const validarCrearVehiculo = (req, res, next) => {
  const { placa, tipo, clienteId } = req.body;

  if (!placa || placa.trim() === "") {
    return res.status(400).json({ error: ERROR_MESSAGES.VEHICULO_PLACA_OBLIGATORIA });
  }

  const tiposValidos = Object.values(TIPO_VEHICULO);
  if (!tipo || !tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: ERROR_MESSAGES.VEHICULO_TIPO_INVALIDO });
  }

  if (!clienteId || isNaN(clienteId)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.VEHICULO_CLIENTE_ID_OBLIGATORIO
    });
  }

  next();
};