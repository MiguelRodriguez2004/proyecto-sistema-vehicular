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
 * Middleware para inyectar los datos del usuario de la base de datos local
 * buscando por el correo electrónico contenido en el token de Auth0.
 * Si el usuario no existe en la base de datos, se deniega el acceso (403).
 */
export const injectUser = async (req, res, next) => {
  try {
    // express-oauth2-jwt-bearer guarda la información del token verificado en req.auth
    if (!req.auth) {
      return res.status(401).json({ error: "No autorizado. Token no válido o ausente." });
    }

    // Se extrae el email desde el Custom Claim inyectado en el Access Token.
    // Usamos el namespace por defecto configurado en las Acciones de Auth0.
    const namespace = "https://sistema-vehicular.com";
    const email = req.auth.payload[`${namespace}/email`] || req.auth.payload.email;

    if (!email) {
      return res.status(400).json({
        error: "El token de acceso no contiene el correo electrónico. Asegúrate de configurar la acción personalizada en Auth0 para incluir el correo como custom claim.",
      });
    }

    // Buscamos el usuario en nuestra base de datos local (fuente de verdad para roles y estado)
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Si el administrador no ha creado previamente el usuario en la base de datos
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
