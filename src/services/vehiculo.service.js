import prisma from "../config/prisma.js";

export const crearVehiculoService = async (data) => {
  const { placa, clienteId } = data;

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

/**
 * Obtiene la lista de vehículos con filtros opcionales.
 * @param {Object} filtros - Filtros de búsqueda (clienteId)
 */
export const listarVehiculosService = async (filtros = {}) => {
  const { clienteId } = filtros;

  return await prisma.vehiculo.findMany({
    where: {
      ...(clienteId && { clienteId: Number(clienteId) })
    },
    include: {
      cliente: true
    }
  });
};