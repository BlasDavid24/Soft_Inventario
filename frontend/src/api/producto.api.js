import api from './client'

export const obtenerCatalogoProductosApi = async () => {
  const respuesta = await api.get('/productos/filtrar');
  return respuesta.data;
};

export const obtenerProductoPorIdApi = async (id) => {
  const respuesta = await api.get(`/productos/filtrar ID/${id}`);
  return respuesta.data;
};

export const crearProductoApi = async (datosProducto) => {
  const respuesta = await api.post('/productos/crear', datosProducto);
  return respuesta.data;
};

export const actualizarProductoApi = async (id, datosProducto) => {
  const respuesta = await api.put(`/productos/editar/${id}`, datosProducto);
  return respuesta.data;
};

export const cambiarEstadoProductoApi = async (id, activo) => {
  const respuesta = await api.patch(`/productos/desactivar/${id}`, { activo });
  return respuesta.data;
};