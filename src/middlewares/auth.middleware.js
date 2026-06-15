import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware para validar el JWT firmado localmente.
 * Verifica la firma y verifica si el usuario sigue existiendo y activo.
 */
export const injectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "unauthorized", message: "Token no proporcionado o inválido." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.id },
      });

      if (!usuario) {
        return res.status(403).json({
          error: "unauthorized_user",
          message: "Acceso denegado. Este usuario no existe.",
        });
      }

      if (!usuario.activo) {
        return res.status(403).json({
          error: "inactive_user",
          message: "Acceso denegado. Tu cuenta se encuentra inactiva.",
        });
      }

      req.user = usuario;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "token_expired", message: "El token ha expirado." });
      }
      return res.status(401).json({ error: "invalid_token", message: "Token inválido." });
    }
  } catch (error) {
    console.error("Error en middleware injectUser:", error);
    res.status(500).json({ error: "Error interno del servidor al autenticar el usuario." });
  }
};

/**
 * Guard para validar si el usuario autenticado tiene los roles necesarios.
 * Debe ser ejecutado obligatoriamente DESPUÉS de 'injectUser'.
 * 
 * @param {string[]} rolesPermitidos - Lista de roles permitidos (ej. ['ADMIN', 'TECNICO'])
 */
export const requireRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        error: "Error interno. El middleware requireRol requiere ejecutar injectUser previamente.",
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere el rol de: ${rolesPermitidos.join(" o ")}`,
      });
    }

    next();
  };
};
