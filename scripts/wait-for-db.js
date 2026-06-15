import net from 'net';
import { URL } from 'url';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL no está definida.");
  process.exit(1);
}

let host = 'db';
let port = 5432;

try {
  // Reemplazamos postgresql:// con http:// para que la clase URL estándar de Node lo analice sin problemas
  const parsed = new URL(dbUrl.replace('postgresql://', 'http://'));
  host = parsed.hostname || 'db';
  port = parsed.port ? parseInt(parsed.port, 10) : 5432;
} catch (err) {
  console.log("No se pudo parsear DATABASE_URL de manera estándar, intentando usar valores por defecto (db:5432).");
}

console.log(`Esperando a que la base de datos en ${host}:${port} esté lista...`);

const checkConnection = () => {
  const socket = new net.Socket();

  socket.setTimeout(2000);

  socket.on('connect', () => {
    console.log("¡Base de datos disponible! Conexión TCP exitosa.");
    socket.destroy();
    process.exit(0);
  });

  socket.on('timeout', () => {
    console.log("Tiempo de espera agotado al intentar conectar. Reintentando en 2 segundos...");
    socket.destroy();
    setTimeout(checkConnection, 2000);
  });

  socket.on('error', (err) => {
    console.log(`Base de datos no disponible aún (${err.message}). Reintentando en 2 segundos...`);
    socket.destroy();
    setTimeout(checkConnection, 2000);
  });

  socket.connect(port, host);
};

checkConnection();
