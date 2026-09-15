import api from './client'

/**
 * Obtiene el listado completo de proveedores desde el backend.
 * @param {Object} params Lista de proveedores.
 */
export const obtenerProveedoresApi = async () => {
  const respuesta = await api.get('/proveedor/filtrar');
  return respuesta.data;
};