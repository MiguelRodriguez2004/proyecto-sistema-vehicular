import prisma from "../config/prisma.js";

export const crearUsuarioService = async (data) => {
    const emailNormalizado = data.email.toLowerCase().trim();

    const usuarioExistente = await prisma.usuario.findUnique({
        where: {
            email: emailNormalizado
        }
    });

    if (usuarioExistente) {
        throw new Error("El email ya está registrado");
    }

    const usuario = await prisma.usuario.create({
        data: {
            ...data,
            email: emailNormalizado
        },
        select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
        }
    });

    return usuario;
};

/**
 * Obtiene el perfil del usuario autenticado por su ID.
 * Devuelve solo campos seguros (sin password).
 *
 * @param {number} id - ID del usuario en la base de datos local.
 * @returns {Promise<Object>} Datos del perfil del usuario.
 */
export const obtenerPerfilService = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            activo: true,
            createdAt: true,
        },
    });

    if (!usuario) {
        throw new Error("Usuario no encontrado.");
    }

    return usuario;
};

/**
 * Actualiza los datos editables del perfil del usuario autenticado.
 * Actualmente solo permite modificar el campo 'nombre'.
 *
 * @param {number} id - ID del usuario en la base de datos local.
 * @param {Object} data - Datos a actualizar ({ nombre: string }).
 * @returns {Promise<Object>} Datos del usuario actualizado (campos seguros).
 */
export const actualizarPerfilService = async (id, data) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
    });

    if (!usuario) {
        throw new Error("Usuario no encontrado.");
    }

    const actualizado = await prisma.usuario.update({
        where: { id },
        data: {
            nombre: data.nombre.trim(),
        },
        select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            activo: true,
            createdAt: true,
        },
    });

    return actualizado;
};