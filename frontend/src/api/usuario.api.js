import api from './client';

/**
 * Obtiene la lista de usuarios con posibles filtros query.
 * @param {Object} params - Filtros opcionales (ej: { rol, activo, buscar })
 */

export const obtenerUsuariosApi = async (params = {}) => {
  const respuesta = await api.get('/usuarios/filtrar', { params });
  return respuesta.data;
};

/**
 * Obtiene un usuario específico por su identificador.
 * @param {number|string} id - Identificador único del usuario
 */
export const obtenerUsuarioPorIdApi = async (id) => {
  const respuesta = await api.get(`/usuarios/filtrar ID/${id}`);
  return respuesta.data;
};

/**
 * Cambia el estado de activación de un usuario.
 * @param {number} id - ID del usuario
 */
export const desactivarUsuarioApi = async (id, nuevoEstado) => {
  const respuesta = await api.patch(`/usuarios/desactivar/${id}`, { activo: nuevoEstado });
  return respuesta.data;
};

/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} datosUsuario - Payload para FastAPI
 */
export const crearUsuarioApi = async (datosUsuario) => {
  const respuesta = await api.post('/usuarios/crear', datosUsuario);
  return respuesta.data;
};


/**
 * Actualiza un usuario existente por su identificador.
 * @param {number|string} id - Identificador único del usuario
 * @param {Object} datosUsuarioActu - Campos actualizados validados por Pydantic
 */
export const actualizarUsuarioApi = async (id, datosUsuarioActu) => {
  const respuesta = await api.put(`/usuarios/editar/${id}`, datosUsuarioActu);
  return respuesta.data;
};

/**
 * Envía la contraseña temporal y la nueva contraseña definitiva para actualizar
 * las credenciales en el primer inicio de sesión.
 *
 * @param {Object} datos - Datos para la actualización de credenciales.
 */
export const cambiarPasswordInicialApi = async (datos) => {
  const res = await api.post('/usuarios/cambiar-password-inicial', datos);
  return res.data;
};
