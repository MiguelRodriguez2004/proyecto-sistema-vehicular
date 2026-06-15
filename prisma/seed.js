import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
    // Generar contraseña por defecto (configurable en .env o por defecto 'Admin123!')
    const saltRounds = 10;
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // Si no existe, lo creamos con contraseña
    const nuevoAdmin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador Sistema',
        email: emailNormalizado,
        password: hashedPassword,
        rol: 'ADMIN',
        activo: true,
      },
    });
    console.log(`✅ Nuevo administrador creado con éxito:`, nuevoAdmin);
    console.log(`🔑 Contraseña inicial: ${defaultPassword}`);
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
