import {
  crearOrdenService,
  listarOrdenesService,
  obtenerOrdenPorIdService,
  cambiarEstadoOrdenService
} from "../services/orden.service.js";

/**
 * Controlador para crear una nueva orden de servicio.
 */
export const crearOrden = async (req, res) => {
  try {
    const orden = await crearOrdenService(req.body);

    res.status(201).json({
      success: true,
      message: "Orden de servicio creada correctamente",
      data: orden
    });
  } catch (error) {
    console.error("Error creando orden:", error);

    if (
      error.message.includes("no existe") ||
      error.message.includes("no es válido") ||
      error.message.includes("válido")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creando la orden",
      error: error.message
    });
  }
};

/**
 * Controlador para listar todas las órdenes con filtros opcionales.
 */
export const listarOrdenes = async (req, res) => {
  try {
    const ordenes = await listarOrdenesService(req.query);
    
    // Mapear cada orden para formatear _count de Prisma a cantidadNovedades
    const formattedOrdenes = ordenes.map(orden => {
      const { _count, ...rest } = orden;
      return {
        ...rest,
        cantidadNovedades: _count?.novedades || 0
      };
    });

    res.status(200).json({
      success: true,
      message: "Órdenes obtenidas correctamente",
      data: formattedOrdenes
    });
  } catch (error) {
    console.error("Error al listar órdenes:", error);
    res.status(500).json({
      success: false,
      message: "Error listando órdenes",
      error: error.message
    });
  }
};

/**
 * Controlador para obtener el detalle de una orden por ID.
 */
export const obtenerOrdenPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await obtenerOrdenPorIdService(id);

    if (!orden) {
      return res.status(404).json({
        success: false,
        message: "La orden no existe"
      });
    }

    res.status(200).json({
      success: true,
      message: "Detalle de orden obtenido correctamente",
      data: orden
    });
  } catch (error) {
    console.error(`Error al obtener orden ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo el detalle de la orden",
      error: error.message
    });
  }
};

/**
 * Controlador para actualizar el estado de una orden.
 */
export const cambiarEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const orden = await cambiarEstadoOrdenService(id, estado);

    res.status(200).json({
      success: true,
      message: "Estado de orden actualizado correctamente",
      data: orden
    });
  } catch (error) {
    console.error("Error al cambiar estado de orden:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Error actualizando el estado de la orden",
      error: error.message
    });
  }
};