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