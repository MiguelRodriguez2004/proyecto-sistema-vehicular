import express from "express";
import {
  listarUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
} from "../controllers/adminUsuario.controller.js";
import { checkJwt, injectUser, requireRol } from "../middlewares/auth.middleware.js";
import { ROL } from "../constants/index.js";

const router = express.Router();

/**
 * Todas las rutas de este archivo están protegidas por:
 * 1. checkJwt - Valida el token JWT de Auth0.
 * 2. injectUser - Inyecta los datos del usuario desde la DB local.
 * 3. requireRol(["ADMIN"]) - Solo permite acceso a administradores.
 */
router.use(checkJwt, injectUser, requireRol(["ADMIN"]));

// ─────────────────────────────────────────────
// Middleware de validación inline
// ─────────────────────────────────────────────

const rolesValidos = Object.values(ROL);

/**
 * Validación para crear un usuario administrativamente.
 */
const validarCrearUsuarioAdmin = (req, res, next) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || nombre.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "El nombre es obligatorio y debe tener al menos 2 caracteres.",
    });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "El correo electrónico es obligatorio y debe ser válido.",
    });
  }

  if (!rol || !rolesValidos.includes(rol)) {
    return res.status(400).json({
      success: false,
      message: `El rol es obligatorio y debe ser uno de: ${rolesValidos.join(", ")}`,
    });
  }

  next();
};

/**
 * Validación para actualizar un usuario administrativamente.
 */
const validarActualizarUsuarioAdmin = (req, res, next) => {
  const { nombre, email, rol } = req.body;

  if (nombre !== undefined && nombre.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "El nombre debe tener al menos 2 caracteres.",
    });
  }

  if (email !== undefined && !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "El correo electrónico debe ser válido.",
    });
  }

  if (rol !== undefined && !rolesValidos.includes(rol)) {
    return res.status(400).json({
      success: false,
      message: `El rol debe ser uno de: ${rolesValidos.join(", ")}`,
    });
  }

  next();
};

// ─────────────────────────────────────────────
// Rutas
// ─────────────────────────────────────────────

router.get("/admin/users", listarUsuarios);
router.get("/admin/users/:id", obtenerUsuarioPorId);
router.post("/admin/users", validarCrearUsuarioAdmin, crearUsuario);
router.put("/admin/users/:id", validarActualizarUsuarioAdmin, actualizarUsuario);
router.patch("/admin/users/:id/status", cambiarEstadoUsuario);

export default router;
