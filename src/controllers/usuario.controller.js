import { crearUsuarioService, obtenerPerfilService, actualizarPerfilService } from "../services/usuario.service.js";

export const crearUsuario = async (req, res) => {
  try {
    const usuario = await crearUsuarioService(req.body);

    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);

    if (error.message.includes("registrado")) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: "Error creando usuario"
    });
  }
};

/**
 * Controlador para obtener el perfil del usuario autenticado.
 * Utiliza req.user.id inyectado por el middleware injectUser.
 */
export const obtenerPerfil = async (req, res) => {
  try {
    const perfil = await obtenerPerfilService(req.user.id);

    res.status(200).json({
      success: true,
      message: "Perfil obtenido correctamente",
      data: perfil,
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);

    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Error obteniendo el perfil del usuario",
    });
  }
};

/**
 * Controlador para actualizar el perfil del usuario autenticado.
 * Solo permite modificar campos editables (actualmente: nombre).
 */
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio y debe tener al menos 2 caracteres.",
      });
    }

    const perfil = await actualizarPerfilService(req.user.id, { nombre });

    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: perfil,
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);

    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Error actualizando el perfil del usuario",
    });
  }
};