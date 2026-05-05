export const validarCrearCliente = (req, res, next) => {
  const { nombre, documento, telefono } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nombreRegex.test(nombre)) {
    return res.status(400).json({ error: "El nombre solo debe contener letras" });
  }

  if (!documento) {
    return res.status(400).json({ error: "El documento es obligatorio" });
  }

  if (!telefono) {
    return res.status(400).json({ error: "El teléfono es obligatorio" });
  }

  const telefonoRegex = /^\d+$/;
  if (!telefonoRegex.test(telefono)) {
    return res.status(400).json({ error: "El teléfono solo debe contener números" });
  }

  next();
};
