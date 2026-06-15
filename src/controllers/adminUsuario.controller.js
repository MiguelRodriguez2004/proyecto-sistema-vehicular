import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { enviarCorreo } from "../services/email.service.js";
import dotenv from "dotenv";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
 * 1. Lo registra en la base de datos local con una contraseña temporal encriptada.
 * 2. Le genera un token de restablecimiento de contraseña.
 * 3. Le envía un correo para que configure su contraseña.
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

    // Contraseña temporal segura que no se le da al usuario directamente
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Generar token para que el usuario configure su propia clave inicial
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 86400000); // 24 horas

    // Paso 2: Crear en la base de datos local
    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: emailNormalizado,
        password: hashedPassword,
        rol,
        activo: true,
        resetToken,
        resetTokenExpiry,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    // Paso 3: Enviar correo de bienvenida con enlace para configurar contraseña
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>¡Bienvenido a Sistema Vehicular!</h2>
      <p>Hola ${usuario.nombre},</p>
      <p>Un administrador ha creado una cuenta para ti con el rol de <strong>${usuario.rol}</strong>.</p>
      <p>Para poder ingresar al sistema, necesitas configurar tu contraseña haciendo clic en el siguiente enlace:</p>
      <a href="${resetUrl}" target="_blank">Configurar mi contraseña</a>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Si tienes problemas, contacta al administrador.</p>
    `;

    // Intentamos enviar el correo, pero si falla no revertimos la creación del usuario
    try {
      await enviarCorreo(usuario.email, "Bienvenido - Configura tu contraseña", html);
    } catch (emailError) {
      console.error("No se pudo enviar el correo de bienvenida:", emailError);
      // Podrías devolver el enlace en la respuesta como fallback si el correo falla en dev
      return res.status(201).json({
        success: true,
        message: "Usuario creado, pero hubo un error enviando el correo. Enlace generado: " + resetUrl,
        data: usuario,
      });
    }

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente. Se le ha enviado un correo para configurar su contraseña.",
      data: usuario,
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ success: false, message: "Error creando usuario." });
  }
};

/**
 * Actualiza los datos de un usuario existente:
 * - Actualiza nombre, email y rol en la base de datos local.
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
      },
    });

    res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente.",
      data: actualizado,
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ success: false, message: "Error actualizando usuario." });
  }
};

/**
 * Activa o desactiva un usuario:
 * - Cambia el campo `activo` en la base de datos local.
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
      },
    });

    res.status(200).json({
      success: true,
      message: activo ? "Usuario activado correctamente." : "Usuario desactivado correctamente.",
      data: actualizado,
    });
  } catch (error) {
    console.error("Error cambiando estado de usuario:", error);
    res.status(500).json({ success: false, message: "Error cambiando estado del usuario." });
  }
};
