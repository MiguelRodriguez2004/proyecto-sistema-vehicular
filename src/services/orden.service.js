import prisma from "../config/prisma.js";
import { ERROR_MESSAGES, ESTADO_ORDEN, ROL } from "../constants/index.js";

/**
 * Crea una nueva orden de servicio validando la existencia de vehículo y técnico.
 * @param {Object} data - Datos de la orden
 */
export const crearOrdenService = async (data) => {
  const { vehiculoId, tecnicoId, diagnostico, kilometraje, tipoServicio } = data;

  // 🔍 Validar vehículo
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { id: Number(vehiculoId) }
  });

  if (!vehiculo) {
    throw new Error(ERROR_MESSAGES.VEHICULO_NO_EXISTE);
  }

  // 🔍 Validar técnico
  const tecnico = await prisma.usuario.findUnique({
    where: { id: Number(tecnicoId) }
  });

  if (!tecnico || tecnico.rol !== ROL.TECNICO) {
    throw new Error(ERROR_MESSAGES.USUARIO_TECNICO_INVALIDO);
  }

  // ✅ Crear orden
  const orden = await prisma.ordenServicio.create({
    data: {
      vehiculoId: Number(vehiculoId),
      tecnicoId: Number(tecnicoId),
      diagnostico,
      kilometraje: (kilometraje !== undefined && kilometraje !== null && kilometraje !== "") ? Number(kilometraje) : null,
      tipoServicio: tipoServicio ? tipoServicio.toUpperCase() : null,
      estado: ESTADO_ORDEN.RECIBIDO
    }
  });

  return orden;
};

/**
 * Lista las órdenes de servicio con filtros opcionales por estado y técnico.
 * @param {Object} filtros - Filtros de búsqueda (estado, tecnicoId)
 */
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
      tecnico: true,
      _count: {
        select: { novedades: true }
      }
    },
    orderBy: {
      fechaIngreso: "desc"
    }
  });
};

/**
 * Obtiene una orden por su ID con todo el detalle asociado (vehículo, cliente, técnico, novedades).
 * @param {number|string} id - ID de la orden
 */
export const obtenerOrdenPorIdService = async (id) => {
  return await prisma.ordenServicio.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      vehiculo: {
        include: {
          cliente: true
        }
      },
      tecnico: true,
      novedades: {
        include: {
          fotos: true
        }
      }
    }
  });
};

/**
 * Cambia el estado de una orden de servicio validando previamente su existencia.
 * @param {number|string} id - ID de la orden
 * @param {string} estado - Nuevo estado
 */
export const cambiarEstadoOrdenService = async (id, estado) => {
  const orden = await prisma.ordenServicio.findUnique({
    where: { id: Number(id) }
  });

  if (!orden) {
    throw new Error(ERROR_MESSAGES.ORDEN_NO_EXISTE);
  }

  return await prisma.ordenServicio.update({
    where: { id: Number(id) },
    data: { estado }
  });
};