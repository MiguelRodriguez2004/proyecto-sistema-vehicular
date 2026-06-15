import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    console.log('Obteniendo usuarios...');
    const usuarios = await prisma.usuario.findMany();
    
    const saltRounds = 10;
    const defaultPassword = 'Cambiame123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    console.log(`Se actualizarán ${usuarios.length} usuarios con la contraseña por defecto.`);

    for (const usuario of usuarios) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { password: hashedPassword, auth0Id: null }
      });
      console.log(`Usuario actualizado: ${usuario.email}`);
    }

    console.log('Migración de usuarios completada exitosamente.');
  } catch (error) {
    console.error('Error migrando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();
