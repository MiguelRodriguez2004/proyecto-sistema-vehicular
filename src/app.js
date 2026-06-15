import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import { readFile } from 'fs/promises';
import clienteRoutes from "./routes/cliente.routes.js";
import ordenRoutes from "./routes/orden.routes.js";
import vehiculoRoutes from "./routes/vehiculo.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import novedadRoutes from "./routes/novedad.routes.js";
import adminUsuarioRoutes from "./routes/adminUsuario.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Configuración de Swagger
try {
  const swaggerFile = new URL('./swagger-output.json', import.meta.url);
  const swaggerDocument = JSON.parse(await readFile(swaggerFile));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.log('Documentación Swagger no disponible aún. Ejecuta npm run swagger.');
}

// rutas
app.use("/api", authRoutes);
app.use("/api", clienteRoutes);
app.use("/api", vehiculoRoutes);
app.use("/api", ordenRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", novedadRoutes);
app.use("/api", adminUsuarioRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});