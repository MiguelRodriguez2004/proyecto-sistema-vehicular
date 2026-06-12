import prisma from "../config/prisma.js";
import {
  crearUsuarioEnAuth0,
  actualizarUsuarioEnAuth0,
  cambiarEstadoEnAuth0,
} from "../services/auth0Management.service.js";

/**
 * Lista todos los usuarios registrados en la base de datos local.
 * Solo accesible por administradores (protegido por requireRol en las rutas).
 */
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        auth0Id: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: usuarios,
    });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    res.status(500).json({ success: false, message: "Error listando usuarios." });
  }
};

/**
 * Obtiene un usuario específico por su ID local.
 */
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        auth0Id: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ success: false, message: "Error obteniendo usuario." });
  }
};

/**
 * Crea un nuevo usuario:
 * 1. Lo crea en Auth0 (Management API) obteniendo su auth0Id.
 * 2. Lo registra en la base de datos local vinculando el auth0Id.
 * 3. Auth0 le envía un correo para que configure su contraseña.
 */
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, rol } = req.body;
    const emailNormalizado = email.toLowerCase().trim();

    // Verificar que no exista ya en la base de datos local
    const existente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        message: `El correo ${emailNormalizado} ya está registrado en el sistema.`,
      });
    }

    // Paso 1: Crear en Auth0
    const auth0User = await crearUsuarioEnAuth0(emailNormalizado, nombre);

    // Paso 2: Crear en la base de datos local
    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: emailNormalizado,
        rol,
        activo: true,
        auth0Id: auth0User.auth0Id,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        auth0Id: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente. Se le ha enviado un correo para configurar su contraseña.",
      data: usuario,
    });
  } catch (error) {
    console.error("Error creando usuario:", error);

    // Si el error viene de Auth0
    if (error.message.includes("Auth0") || error.message.includes("registrado")) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Error creando usuario." });
  }
};

/**
 * Actualiza los datos de un usuario existente:
 * - Actualiza nombre, email y rol en la base de datos local.
 * - Si el email o nombre cambian, también los actualiza en Auth0.
 */
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    const emailNormalizado = email ? email.toLowerCase().trim() : usuario.email;

    // Verificar que el email no esté en uso por otro usuario
    if (emailNormalizado !== usuario.email) {
      const emailEnUso = await prisma.usuario.findUnique({
        where: { email: emailNormalizado },
      });
      if (emailEnUso) {
        return res.status(400).json({
          success: false,
          message: `El correo ${emailNormalizado} ya está en uso por otro usuario.`,
        });
      }
    }

    // Actualizar en Auth0 si tiene auth0Id vinculado
    const datosAuth0 = {};
    if (nombre && nombre.trim() !== usuario.nombre) datosAuth0.nombre = nombre.trim();
    if (emailNormalizado !== usuario.email) datosAuth0.email = emailNormalizado;

    if (Object.keys(datosAuth0).length > 0) {
      await actualizarUsuarioEnAuth0(usuario.auth0Id, datosAuth0);
    }

    // Actualizar en la base de datos local
    const actualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre ? nombre.trim() : usuario.nombre,
        email: emailNormalizado,
        rol: rol || usuario.rol,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        auth0Id: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente.",
      data: actualizado,
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);

    if (error.message.includes("Auth0")) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Error actualizando usuario." });
  }
};

/**
 * Activa o desactiva un usuario:
 * - Cambia el campo `activo` en la base de datos local.
 * - Bloquea o desbloquea al usuario en Auth0.
 */
export const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "El campo 'activo' debe ser un valor booleano (true/false).",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado." });
    }

    // Evitar que un admin se desactive a sí mismo
    if (usuario.id === req.user.id && !activo) {
      return res.status(400).json({
        success: false,
        message: "No puedes desactivar tu propia cuenta.",
      });
    }

    // Cambiar estado en Auth0
    await cambiarEstadoEnAuth0(usuario.auth0Id, !activo);

    // Cambiar estado en la base de datos local
    const actualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { activo },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        auth0Id: true,
      },
    });

    res.status(200).json({
      success: true,
      message: activo ? "Usuario activado correctamente." : "Usuario desactivado correctamente.",
      data: actualizado,
    });
  } catch (error) {
    console.error("Error cambiando estado de usuario:", error);

    if (error.message.includes("Auth0")) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Error cambiando estado del usuario." });
  }
};
