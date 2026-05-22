import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/cliente.routes.js";
import ordenRoutes from "./routes/orden.routes.js";
import vehiculoRoutes from "./routes/vehiculo.routes.js";
import listarOrdenRoutes from "./routes/listarOrden.routes.js";
import cambiarEstadoOrdenRoutes from "./routes/cambiarEstadoOrden.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/api", clienteRoutes);
app.use("/api", vehiculoRoutes);
app.use("/api", ordenRoutes);
app.use("/api", listarOrdenRoutes);
app.use("/api", cambiarEstadoOrdenRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});