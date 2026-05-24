import { crearUsuarioService } from "../services/usuario.service.js";

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