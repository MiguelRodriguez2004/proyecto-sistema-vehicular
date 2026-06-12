import dotenv from "dotenv";

dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_M2M_CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID;
const AUTH0_M2M_CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET;

/**
 * Caché en memoria del token de la Management API.
 * Evita solicitar un nuevo token en cada petición al Management API.
 */
let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

/**
 * Obtiene un Access Token para la Auth0 Management API
 * usando el flujo Client Credentials (M2M).
 * El token se cachea en memoria hasta que expire.
 *
 * @returns {Promise<string>} Access Token válido.
 */
const obtenerManagementToken = async () => {
  // Si el token cacheado aún es válido (con 60s de margen), reutilizarlo
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.accessToken;
  }

  const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: AUTH0_M2M_CLIENT_ID,
      client_secret: AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error obteniendo Management API Token:", error);
    throw new Error(`No se pudo obtener el token de la Management API: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
};

/**
 * Genera una contraseña temporal segura.
 * Cumple con los requisitos por defecto de Auth0:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula, una minúscula, un número y un símbolo
 *
 * @returns {string} Contraseña temporal aleatoria.
 */
const generarPasswordTemporal = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  const length = 16;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Asegurar complejidad mínima
  password += "Aa1!";
  return password;
};

/**
 * Crea un usuario en Auth0 usando la Management API.
 * Utiliza la conexión "Username-Password-Authentication".
 *
 * @param {string} email - Correo electrónico del nuevo usuario.
 * @param {string} nombre - Nombre completo del nuevo usuario.
 * @returns {Promise<Object>} Datos del usuario creado en Auth0 (incluye user_id).
 */
export const crearUsuarioEnAuth0 = async (email, nombre) => {
  const token = await obtenerManagementToken();
  const password = generarPasswordTemporal();

  const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email,
      name: nombre,
      password,
      connection: "Username-Password-Authentication",
      email_verified: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error creando usuario en Auth0:", error);

    if (error.statusCode === 409) {
      throw new Error(`El correo ${email} ya está registrado en Auth0.`);
    }

    throw new Error(`Error de Auth0: ${error.message || error.error}`);
  }

  const auth0User = await response.json();

  // Solicitar correo de cambio de contraseña para que el usuario configure la suya
  try {
    await fetch(`https://${AUTH0_DOMAIN}/dbconnections/change_password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: AUTH0_M2M_CLIENT_ID,
        email,
        connection: "Username-Password-Authentication",
      }),
    });
    console.log(`📧 Correo de restablecimiento de contraseña enviado a ${email}`);
  } catch (resetError) {
    console.warn("⚠️ No se pudo enviar el correo de restablecimiento:", resetError.message);
  }

  return {
    auth0Id: auth0User.user_id,
    email: auth0User.email,
    nombre: auth0User.name,
  };
};

/**
 * Actualiza los datos de un usuario en Auth0.
 *
 * @param {string} auth0Id - Identificador del usuario en Auth0 (ej: "auth0|abc123").
 * @param {Object} data - Datos a actualizar ({ email?, name? }).
 */
export const actualizarUsuarioEnAuth0 = async (auth0Id, data) => {
  if (!auth0Id) return; // Si no tiene auth0Id vinculado, no hay nada que actualizar en Auth0

  const token = await obtenerManagementToken();
  const body = {};

  if (data.email) body.email = data.email;
  if (data.nombre) body.name = data.nombre;

  if (Object.keys(body).length === 0) return;

  const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0Id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error actualizando usuario en Auth0:", error);
    throw new Error(`Error actualizando en Auth0: ${error.message || error.error}`);
  }
};

/**
 * Bloquea o desbloquea un usuario en Auth0.
 *
 * @param {string} auth0Id - Identificador del usuario en Auth0.
 * @param {boolean} bloqueado - true para bloquear, false para desbloquear.
 */
export const cambiarEstadoEnAuth0 = async (auth0Id, bloqueado) => {
  if (!auth0Id) return;

  const token = await obtenerManagementToken();

  const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0Id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ blocked: bloqueado }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error cambiando estado en Auth0:", error);
    throw new Error(`Error cambiando estado en Auth0: ${error.message || error.error}`);
  }
};
