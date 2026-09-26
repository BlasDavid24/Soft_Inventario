import api from './client';

export const obtenerProveProducApi = async () => {
  const respuesta = await api.get('/proveedor-producto/filtrar');
  return respuesta.data;
};

export const obtenerProductosPorProveedorApi = async (proveedorId) => {
  const respuesta = await api.get('/proveedor-producto/filtrar', {
    params: { proveedor_id: proveedorId },
  });
  return respuesta.data;
};

export const crearProveedorProductoApi = async (datos) => {
  const respuesta = await api.post('/proveedor-producto/crear', datos);
  return respuesta.data;
};

export const eliminarProveedorProductoApi = async (idRelacion) => {
  const respuesta = await api.delete(`/proveedor-producto/eliminar/${idRelacion}`);
  return respuesta.data;
};