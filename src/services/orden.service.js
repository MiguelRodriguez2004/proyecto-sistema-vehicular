import prisma from "../config/prisma.js";

export const crearOrdenService = async (data) => {
  const { vehiculoId, tecnicoId, descripcion } = data;

  // 🔍 Validar vehículo
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: vehiculoId }
  });

  if (!vehiculo) {
    throw new Error("El vehículo no existe");
  }

  // 🔍 Validar técnico
  const tecnico = await prisma.usuario.findUnique({
    where: { id: tecnicoId }
  });

  if (!tecnico || tecnico.rol !== "TECNICO") {
    throw new Error("El técnico no es válido");
  }

  // ✅ Crear orden
  const orden = await prisma.ordenServicio.create({
    data: {
      vehiculoId,
      tecnicoId,
      descripcion,
      estado: "RECIBIDO"
    }
  });

  return orden;
};