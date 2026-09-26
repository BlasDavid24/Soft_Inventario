import api from './client';

export const obtenerUsuariosApi = async (params = {}) => {
  const respuesta = await api.get('/usuarios/filtrar', { params });
  return respuesta.data;
};

export const obtenerUsuarioPorIdApi = async (id) => {
  const respuesta = await api.get(`/usuarios/filtrar ID/${id}`);
  return respuesta.data;
};

export const desactivarUsuarioApi = async (id, nuevoEstado) => {
  const respuesta = await api.patch(`/usuarios/desactivar/${id}`, { activo: nuevoEstado });
  return respuesta.data;
};

export const crearUsuarioApi = async (datosUsuario) => {
  const respuesta = await api.post('/usuarios/crear', datosUsuario);
  return respuesta.data;
};

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
