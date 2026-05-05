import prisma from "../config/prisma.js";

export const crearClienteService = async (clienteData) => {
  return await prisma.cliente.create({
    data: clienteData
  });
};
