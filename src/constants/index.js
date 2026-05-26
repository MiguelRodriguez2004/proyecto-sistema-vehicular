/**
 * Constantes de Roles de Usuario
 */
export const ROL = {
  ADMIN: "ADMIN",
  TECNICO: "TECNICO"
};

/**
 * Constantes de Tipos de Vehículo
 */
export const TIPO_VEHICULO = {
  AUTO: "AUTO",
  MOTO: "MOTO"
};

/**
 * Constantes de Estados de Orden de Servicio
 */
export const ESTADO_ORDEN = {
  RECIBIDO: "RECIBIDO",
  EN_REVISION: "EN_REVISION",
  EN_PROCESO: "EN_PROCESO",
  FINALIZADO: "FINALIZADO",
  ENTREGADO: "ENTREGADO"
};

/**
 * Constantes de Tipos de Novedad
 */
export const TIPO_NOVEDAD = {
  ESTETICO: "ESTETICO",
  MECANICO: "MECANICO",
  ELECTRICO: "ELECTRICO",
  GENERAL: "GENERAL"
};

/**
 * Constantes de Tipos de Servicio
 */
export const TIPO_SERVICIO = {
  PREVENTIVO: "PREVENTIVO",
  CORRECTIVO: "CORRECTIVO",
  DIAGNOSTICO: "DIAGNOSTICO"
};

/**
 * Diccionario centralizado de mensajes de error de validación
 */
export const ERROR_MESSAGES = {
  // Cliente
  CLIENTE_NOMBRE_OBLIGATORIO: "El nombre es obligatorio",
  CLIENTE_NOMBRE_LETRAS: "El nombre solo debe contener letras",
  CLIENTE_DOCUMENTO_OBLIGATORIO: "El documento es obligatorio",
  CLIENTE_TELEFONO_OBLIGATORIO: "El teléfono es obligatorio",
  CLIENTE_TELEFONO_NUMEROS: "El teléfono solo debe contener números",
  
  // Vehículo
  VEHICULO_PLACA_OBLIGATORIA: "La placa es obligatoria",
  VEHICULO_TIPO_INVALIDO: "Tipo inválido (AUTO o MOTO)",
  VEHICULO_CLIENTE_ID_OBLIGATORIO: "clienteId es obligatorio y debe ser numérico",
  VEHICULO_NO_EXISTE: "El vehículo no existe",

  // Usuario
  USUARIO_NOMBRE_OBLIGATORIO: "El nombre es obligatorio",
  USUARIO_EMAIL_OBLIGATORIO: "El email es obligatorio",
  USUARIO_PASSWORD_MIN_CHARS: "La contraseña debe tener mínimo 6 caracteres",
  USUARIO_ROL_INVALIDO: "Rol inválido",
  USUARIO_TECNICO_INVALIDO: "El técnico no es válido",
  USUARIO_EMAIL_REGISTRADO: "El email ya está registrado",

  // Novedad
  NOVEDAD_TIPO_INVALIDO: "Tipo de novedad inválido",
  NOVEDAD_DESCRIPCION_OBLIGATORIA: "La descripción es obligatoria",
  NOVEDAD_ORDEN_ID_INVALIDO: "ordenId inválido",

  // Orden
  ORDEN_ID_OBLIGATORIO: "El ID de la orden es obligatorio",
  ORDEN_ID_ENTERO_POSITIVO: "El ID de la orden debe ser un número entero positivo",
  ORDEN_NO_EXISTE: "La orden no existe",
  ORDEN_VEHICULO_ID_OBLIGATORIO: "vehiculoId es obligatorio",
  ORDEN_TECNICO_ID_OBLIGATORIO: "tecnicoId es obligatorio",
  ORDEN_ESTADO_INVALIDO: "Estado de orden inválido",
  ORDEN_KILOMETRAJE_NUMERO: "El kilometraje debe ser un número entero no negativo",
  ORDEN_TIPO_SERVICIO_INVALIDO: "El tipo de servicio no es válido"
};

