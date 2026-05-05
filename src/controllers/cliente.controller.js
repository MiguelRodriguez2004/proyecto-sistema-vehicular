import { crearClienteService } from "../services/cliente.service.js";

export const crearCliente = async (req, res) => {
  try {
    const { nombre, documento, telefono } = req.body;

    const cliente = await crearClienteService({
      nombre,
      documento,
      telefono
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando cliente" });
  }
};