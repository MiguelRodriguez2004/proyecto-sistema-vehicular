import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { enviarCorreo } from "../services/email.service.js";
import dotenv from "dotenv";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas." });
    }

    if (!usuario.activo) {
      return res.status(403).json({ success: false, message: "Cuenta inactiva. Contacta al administrador." });
    }

    if (!usuario.password) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas." });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas." });
    }

    const payload = {
      id: usuario.id,
      rol: usuario.rol,
      email: usuario.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "El correo es requerido." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario || !usuario.activo) {
      // Por seguridad, no revelamos si el correo existe o no
      return res.status(200).json({ success: true, message: "Si el correo existe, se ha enviado un enlace de recuperación." });
    }

    // Generar token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Recuperación de Contraseña</h2>
      <p>Hola ${usuario.nombre},</p>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" target="_blank">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `;

    await enviarCorreo(usuario.email, "Recuperación de Contraseña", html);

    res.status(200).json({ success: true, message: "Si el correo existe, se ha enviado un enlace de recuperación." });
  } catch (error) {
    console.error("Error en forgot password:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token y nueva contraseña son requeridos." });
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() }, // El token no ha expirado
      },
    });

    if (!usuario) {
      return res.status(400).json({ success: false, message: "Token inválido o expirado." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ success: true, message: "Contraseña restablecida exitosamente." });
  } catch (error) {
    console.error("Error en reset password:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
};
