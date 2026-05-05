import prisma from "../config/prisma.js";

export const listarOrdenesService = async (filtros) => {
  const { estado, tecnicoId } = filtros;

  return await prisma.ordenServicio.findMany({
    where: {
      ...(estado && { estado }),
      ...(tecnicoId && { tecnicoId: Number(tecnicoId) })
    },
    include: {
      vehiculo: {
        include: {
          cliente: true
        }
      },
      tecnico: true
    },
    orderBy: {
      fechaIngreso: "desc"
    }
  });
};