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
 * Caché en memoria para respuestas de /userinfo.
 * Evita llamar a Auth0 en cada request del mismo usuario.
 * Formato: Map<auth0Id, { email, name, expiresAt }>
 */
const userinfoCache = new Map();
const USERINFO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene el email del usuario desde el endpoint /userinfo de Auth0.
 * Este endpoint acepta el Access Token del usuario y devuelve su perfil.
 * Se usa como fallback cuando el email no viene como Custom Claim en el JWT.
 *
 * @param {string} accessToken - Access Token JWT del request actual.
 * @param {string} auth0Id - Sub claim del token, usado como clave de caché.
 * @returns {Promise<{email: string|null, name: string|null}>}
 */
const obtenerEmailDesdeUserinfo = async (accessToken, auth0Id) => {
  // Revisar caché primero
  const cached = userinfoCache.get(auth0Id);
  if (cached && Date.now() < cached.expiresAt) {
    return { email: cached.email, name: cached.name };
  }

  try {
    const issuer = process.env.AUTH0_ISSUER_BASE_URL.replace(/\/$/, "");
    const response = await fetch(`${issuer}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.warn(`⚠️ /userinfo respondió con status ${response.status}`);
      return { email: null, name: null };
    }

    const data = await response.json();

    // Guardar en caché
    userinfoCache.set(auth0Id, {
      email: data.email || null,
      name: data.name || null,
      expiresAt: Date.now() + USERINFO_CACHE_TTL_MS,
    });

    return { email: data.email || null, name: data.name || null };
  } catch (err) {
    console.error("Error consultando /userinfo de Auth0:", err.message);
    return { email: null, name: null };
  }
};

/**
 * Middleware para inyectar los datos del usuario de la base de datos local.
 *
 * Estrategia de búsqueda (en orden de prioridad):
 * 1. Busca por `auth0Id` (el campo `sub` del JWT), que es un enlace directo e inequívoco.
 * 2. Si no encuentra por `auth0Id`, intenta obtener el email:
 *    a. Primero desde Custom Claims del token (requiere Auth0 Action configurado).
 *    b. Si no está en el token, llama al endpoint /userinfo de Auth0 como fallback.
 * 3. Si encuentra al usuario por email, auto-vincula su `auth0Id`.
 * 4. Si no existe en la base de datos por ninguna vía, deniega el acceso (403).
 */
export const injectUser = async (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ error: "No autorizado. Token no válido o ausente." });
    }

    const auth0Id = req.auth.payload.sub; // Identificador único de Auth0 (ej: "google-oauth2|abc123")
    const namespace = "https://sistema-vehicular.com";

    // Intentar obtener el email del Custom Claim del token
    let email = req.auth.payload[`${namespace}/email`] || req.auth.payload.email;

    let usuario = null;

    // Paso 1: Buscar por auth0Id (enlace directo e inequívoco)
    if (auth0Id) {
      usuario = await prisma.usuario.findUnique({
        where: { auth0Id },
      });
    }

    // Paso 2: Si no se encontró por auth0Id, buscar por email
    if (!usuario) {
      // Si el email no viene en el token, obtenerlo de /userinfo (fallback)
      if (!email) {
        const rawToken = req.headers.authorization?.split(" ")[1];
        if (rawToken) {
          const userinfo = await obtenerEmailDesdeUserinfo(rawToken, auth0Id);
          email = userinfo.email;
          if (email) {
            console.log(`📧 Email obtenido desde /userinfo: ${email}`);
          }
        }
      }

      if (email) {
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
    }

    // Si no se encontró por ninguna vía → acceso denegado
    if (!usuario) {
      console.warn(
        `[AUDIT] [${new Date().toISOString()}] Intento de acceso denegado - Usuario NO registrado en base de datos. Email: "${email || "desconocido"}", Auth0 ID (sub): "${auth0Id}".`
      );
      return res.status(403).json({
        error: "unauthorized_user",
        message: "Acceso denegado. Este usuario no está registrado en el sistema. Solicita a un administrador que te registre primero.",
      });
    }

    // Si el usuario está registrado pero desactivado administrativamente
    if (!usuario.activo) {
      console.warn(
        `[AUDIT] [${new Date().toISOString()}] Intento de acceso denegado - Usuario INACTIVO. Email: "${usuario.email}", ID Local: ${usuario.id}, Auth0 ID (sub): "${auth0Id}".`
      );
      return res.status(403).json({
        error: "inactive_user",
        message: "Acceso denegado. Tu cuenta se encuentra inactiva.",
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
