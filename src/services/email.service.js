import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

// Forzar la resolución DNS a IPv4 (Soluciona el error ENETUNREACH con IPv6 en Render)
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || process.env.SMTP_HOST,
  port: process.env.MAIL_PORT || process.env.SMTP_PORT,
  secure: (process.env.MAIL_PORT || process.env.SMTP_PORT) == 465,
  family: 4, // Fuerza estrictamente a Nodemailer a usar IPv4
  auth: {
    user: process.env.MAIL_USER || process.env.SMTP_USER,
    pass: process.env.MAIL_PASSWORD || process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false }
});

/**
 * Envía un correo electrónico.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} html - Contenido HTML
 */
export const enviarCorreo = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sistema Vehicular" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Correo enviado a ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw new Error("No se pudo enviar el correo");
  }
};
