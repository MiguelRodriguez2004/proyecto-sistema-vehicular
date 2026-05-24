import {
    crearNovedadService,
    obtenerNovedadesPorOrdenService
} from "../services/novedad.service.js";

export const crearNovedad = async (req, res) => {
    try {
        const novedad = await crearNovedadService(req.body);

        res.status(201).json(novedad);
    } catch (error) {
        console.error(error);

        if (error.message.includes("no existe")) {
            return res.status(404).json({
                error: error.message
            });
        }

        res.status(500).json({
            error: "Error creando novedad"
        });
    }
};

export const obtenerNovedadesPorOrden = async (req, res) => {
    try {
        const { ordenId } = req.query;

        if (!ordenId) {
            return res.status(400).json({
                error: "ordenId es requerido"
            });
        }

        const novedades =
            await obtenerNovedadesPorOrdenService(ordenId);

        if (novedades.length === 0) {
            return res.status(200).json({
                message: "La orden no tiene novedades registradas",
                data: []
            });
        }

        res.status(200).json({
            message: "Novedades obtenidas correctamente",
            data: novedades
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo novedades"
        });
    }
};