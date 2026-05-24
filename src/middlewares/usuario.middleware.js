import { ERROR_MESSAGES, ROL } from "../constants/index.js";

export const validarCrearUsuario = (req, res, next) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({
      error: ERROR_MESSAGES.USUARIO_NOMBRE_OBLIGATORIO
    });
  }

  if (!email || email.trim() === "") {
    return res.status(400).json({
      error: ERROR_MESSAGES.USUARIO_EMAIL_OBLIGATORIO
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      error: ERROR_MESSAGES.USUARIO_PASSWORD_MIN_CHARS
    });
  }

  const rolesValidos = Object.values(ROL);

  if (!rol || !rolesValidos.includes(rol)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.USUARIO_ROL_INVALIDO
    });
  }

  next();
};