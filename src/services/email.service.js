import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo electrónico usando Resend.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} html - Contenido HTML
 */
export const enviarCorreo = async (to, subject, html) => {
  try {
    // Si MAIL_FROM no está definido, usamos el correo de onboarding de Resend
    const from = process.env.MAIL_FROM || "Sistema Vehicular <onboarding@resend.dev>";
    
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error devuelto por Resend:", error);
      throw new Error("No se pudo enviar el correo a través de Resend");
    }

    console.log(`📧 Correo enviado exitosamente a ${to}. ID: ${data?.id}`);
    return data;
  } catch (err) {
    console.error("Error en enviarCorreo:", err);
    throw err;
  }
};
