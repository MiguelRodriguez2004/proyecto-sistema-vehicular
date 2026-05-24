import { ERROR_MESSAGES, TIPO_NOVEDAD } from "../constants/index.js";

export const validarCrearNovedad = (req, res, next) => {
  const { tipo, descripcion, ordenId } = req.body;

  const tiposValidos = Object.values(TIPO_NOVEDAD);
  if (!tipo || !tiposValidos.includes(tipo)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.NOVEDAD_TIPO_INVALIDO
    });
  }

  if (!descripcion || descripcion.trim() === "") {
    return res.status(400).json({
      error: ERROR_MESSAGES.NOVEDAD_DESCRIPCION_OBLIGATORIA
    });
  }

  if (!ordenId || isNaN(ordenId)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.NOVEDAD_ORDEN_ID_INVALIDO
    });
  }

  next();
};