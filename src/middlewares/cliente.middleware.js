import { ERROR_MESSAGES } from "../constants/index.js";

export const validarCrearCliente = (req, res, next) => {
  const { nombre, documento, telefono } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: ERROR_MESSAGES.CLIENTE_NOMBRE_OBLIGATORIO });
  }

  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nombreRegex.test(nombre)) {
    return res.status(400).json({ error: ERROR_MESSAGES.CLIENTE_NOMBRE_LETRAS });
  }

  if (!documento) {
    return res.status(400).json({ error: ERROR_MESSAGES.CLIENTE_DOCUMENTO_OBLIGATORIO });
  }

  if (!telefono) {
    return res.status(400).json({ error: ERROR_MESSAGES.CLIENTE_TELEFONO_OBLIGATORIO });
  }

  const telefonoRegex = /^\d+$/;
  if (!telefonoRegex.test(telefono)) {
    return res.status(400).json({ error: ERROR_MESSAGES.CLIENTE_TELEFONO_NUMEROS });
  }

  next();
};
