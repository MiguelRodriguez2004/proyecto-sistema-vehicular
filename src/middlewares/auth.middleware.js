import { auth } from "express-oauth2-jwt-bearer";
import prisma from "../config/prisma.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware para validar el JWT firmado por Auth0.
 * Verifica firma (JWKS), emisor (issuerBaseURL) y audiencia (audience).
 */
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

/**
 * Middleware para inyectar los datos del usuario de la base de datos local.
 * 
 * Estrategia de búsqueda (en orden de prioridad):
 * 1. Busca por `auth0Id` (el campo `sub` del JWT), que es un enlace directo e inequívoco.
 * 2. Si no encuentra por `auth0Id`, busca por email (Custom Claim del token).
 *    - Si lo encuentra por email, actualiza automáticamente su registro para asociarle
 *      el `auth0Id`, de modo que las próximas búsquedas sean directas.
 * 3. Si no existe en la base de datos por ninguna de las dos vías, deniega el acceso (403).
 */
export const injectUser = async (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: "No autorizado. Token no válido o ausente." });
    }

    const auth0Id = req.auth.payload.sub; // Identificador único de Auth0 (ej: "auth0|abc123")
    const namespace = "https://sistema-vehicular.com";
    const email = req.auth.payload[`${namespace}/email`] || req.auth.payload.email;

    let usuario = null;

    // Paso 1: Buscar por auth0Id (enlace directo)
    if (auth0Id) {
      usuario = await prisma.usuario.findUnique({
        where: { auth0Id },
      });
    }

    // Paso 2: Si no se encontró por auth0Id, buscar por email y auto-vincular
    if (!usuario && email) {
      usuario = await prisma.usuario.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      // Auto-vincular el auth0Id para que las próximas búsquedas sean directas
      if (usuario && auth0Id && !usuario.auth0Id) {
        usuario = await prisma.usuario.update({
          where: { id: usuario.id },
          data: { auth0Id },
        });
        console.log(`🔗 auth0Id vinculado automáticamente al usuario ${usuario.email}`);
      }
    }

    // Si no se encontró por ninguna vía
    if (!usuario) {
      return res.status(403).json({
        error: "Acceso denegado. Este usuario no está registrado en el sistema. Solicita a un administrador que te registre primero.",
      });
    }

    // Si el usuario está registrado pero desactivado administrativamente
    if (!usuario.activo) {
      return res.status(403).json({
        error: "Acceso denegado. Tu cuenta se encuentra inactiva.",
      });
    }

    // Adjuntamos el registro del usuario de la base de datos al objeto del request
    req.user = usuario;
    next();
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
