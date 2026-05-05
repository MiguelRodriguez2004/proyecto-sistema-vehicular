import prisma from "../config/prisma.js";

export const crearVehiculoService = async (data) => {
  const { placa, clienteId, chasis } = data;

  // 🔍 Normalizar placa (buena práctica)
  const placaNormalizada = placa.toUpperCase().trim();

  // 🔍 Validar que el cliente exista
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(clienteId) }
  });

  if (!cliente) {
    throw new Error("El cliente no existe");
  }

  // 🔍 Validar placa única
  const vehiculoExistente = await prisma.vehiculo.findUnique({
    where: { placa: placaNormalizada }
  });

  if (vehiculoExistente) {
    throw new Error("La placa ya está registrada");
  }

  // 🔍 Validar chasis único (si viene)
  if (chasis) {
    const chasisExistente = await prisma.vehiculo.findUnique({
      where: { chasis }
    });

    if (chasisExistente) {
      throw new Error("El chasis ya está registrado");
    }
  }

  // ✅ Crear vehículo
  const vehiculo = await prisma.vehiculo.create({
    data: {
      ...data,
      placa: placaNormalizada,
      clienteId: Number(clienteId)
    }
  });

  return vehiculo;
};