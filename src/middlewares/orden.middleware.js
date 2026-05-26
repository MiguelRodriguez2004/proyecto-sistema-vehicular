import { ERROR_MESSAGES, ESTADO_ORDEN, TIPO_SERVICIO } from "../constants/index.js";

export const validarCrearOrden = (req, res, next) => {
  const { vehiculoId, tecnicoId, kilometraje, tipoServicio } = req.body;

  if (!vehiculoId) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_VEHICULO_ID_OBLIGATORIO });
  }

  if (!tecnicoId) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_TECNICO_ID_OBLIGATORIO });
  }

  // Validar kilometraje si se envía
  if (kilometraje !== undefined && kilometraje !== null && kilometraje !== "") {
    const kmNum = Number(kilometraje);
    if (isNaN(kmNum) || kmNum < 0) {
      return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_KILOMETRAJE_NUMERO });
    }
  }

  // Validar tipo de servicio si se envía
  if (tipoServicio) {
    const tiposValidos = Object.values(TIPO_SERVICIO);
    if (!tiposValidos.includes(tipoServicio.toUpperCase())) {
      return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_TIPO_SERVICIO_INVALIDO });
    }
  }

  next();
};


export const validarObtenerOrden = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_ID_OBLIGATORIO });
  }

  const idNum = Number(id);
  if (isNaN(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_ID_ENTERO_POSITIVO });
  }

  next();
};

export const validarCambiarEstadoOrden = (req, res, next) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!id) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_ID_OBLIGATORIO });
  }

  const idNum = Number(id);
  if (isNaN(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_ID_ENTERO_POSITIVO });
  }

  const estadosValidos = Object.values(ESTADO_ORDEN);
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: ERROR_MESSAGES.ORDEN_ESTADO_INVALIDO });
  }

  next();
};