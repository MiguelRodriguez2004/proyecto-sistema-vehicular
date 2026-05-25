import prisma from "../config/prisma.js";

export const crearClienteService = async (clienteData) => {
  return await prisma.cliente.create({
    data: clienteData
  });
};

export const obtenerClientesService = async (filtros = {}) => {
  const { search, documento } = filtros;

  if (documento) {
    return await prisma.cliente.findMany({
      where: {
        documento: documento
      }
    });
  }

  if (search) {
    return await prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: search, mode: "insensitive" } },
          { documento: { contains: search, mode: "insensitive" } }
        ]
      }
    });
  }

  return await prisma.cliente.findMany();
};

