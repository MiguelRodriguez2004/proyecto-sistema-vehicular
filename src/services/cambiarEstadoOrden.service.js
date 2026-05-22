import prisma from "../config/prisma.js";

export const cambiarEstadoOrdenService = async (id, estado) => {
  const orden = await prisma.ordenServicio.findUnique({
    where: { id: Number(id) }
  });

  if (!orden) {
    throw new Error("La orden no existe");
  }

  return await prisma.ordenServicio.update({
    where: { id: Number(id) },
    data: { estado }
  });
};