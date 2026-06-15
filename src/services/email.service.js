import dotenv from "dotenv";

dotenv.config();

/**
 * Envía un correo electrónico usando la API HTTP de Brevo.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} html - Contenido HTML
 */
export const enviarCorreo = async (to, subject, html) => {
  try {
    const url = "https://api.brevo.com/v3/smtp/email";
    
    // Obtenemos las claves del entorno
    const apiKey = process.env.BREVO_API_KEY;
    // Si MAIL_USER no está en Render, usará el predeterminado de tu cuenta.
    const senderEmail = process.env.MAIL_USER || "trackgarageadso@gmail.com";

    const payload = {
      sender: {
        name: "Sistema Vehicular",
        email: senderEmail
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Error devuelto por Brevo:", JSON.stringify(errorData, null, 2));
      throw new Error(`Error HTTP ${response.status}: No se pudo enviar el correo`);
    }

    const data = await response.json();
    console.log(`📧 Correo enviado exitosamente a ${to} mediante Brevo. ID: ${data.messageId}`);
    return data;
  } catch (err) {
    console.error("❌ Error en enviarCorreo (Brevo):", err);
    throw err;
  }
};
