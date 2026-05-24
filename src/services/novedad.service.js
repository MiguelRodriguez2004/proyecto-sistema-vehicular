import prisma from "../config/prisma.js";

export const crearNovedadService = async (data) => {
  const orden = await prisma.ordenServicio.findUnique({
    where: {
      id: Number(data.ordenId)
    }
  });

  if (!orden) {
    throw new Error("La orden no existe");
  }

  const novedad = await prisma.novedad.create({
    data: {
      tipo: data.tipo,
      descripcion: data.descripcion,
      ordenId: Number(data.ordenId)
    }
  });

  return novedad;
};

export const obtenerNovedadesPorOrdenService = async (ordenId) => {
  return await prisma.novedad.findMany({
    where: {
      ordenId: Number(ordenId)
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};