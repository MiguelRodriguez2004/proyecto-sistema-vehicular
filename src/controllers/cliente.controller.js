import { crearClienteService, obtenerClientesService } from "../services/cliente.service.js";

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

export const obtenerClientes = async (req, res) => {
  try {
    const { search, documento } = req.query;

    const clientes = await obtenerClientesService({ search, documento });

    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};