import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'miguelzat913@gmail.com';

  const emailNormalizado = adminEmail.toLowerCase().trim();

  console.log(`🚀 Iniciando seed de base de datos...`);
  console.log(`Buscando/creando administrador con email: ${emailNormalizado}`);

  // Buscar si el usuario ya existe
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email: emailNormalizado },
  });

  if (usuarioExistente) {
    // Si ya existe, nos aseguramos de que sea ADMIN y esté activo
    const actualizado = await prisma.usuario.update({
      where: { email: emailNormalizado },
      data: {
        rol: 'ADMIN',
        activo: true,
      },
    });
    console.log(`✅ Usuario existente actualizado a ADMIN:`, actualizado);
  } else {
    // Si no existe, lo creamos
    const nuevoAdmin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador Sistema',
        email: emailNormalizado,
        rol: 'ADMIN',
        activo: true,
      },
    });
    console.log(`✅ Nuevo administrador creado con éxito:`, nuevoAdmin);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error ejecutando el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
