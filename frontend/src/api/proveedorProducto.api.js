import api from './client';

export const obtenerProveProducApi = async () => {
  const respuesta = await api.get('/proveedor-producto/filtrar');
  return respuesta.
  data;
};

export const obtenerProductosPorProveedorApi = async (proveedorId) => {
  const respuesta = await api.get('/proveedor-producto/filtrar', {
    params: { proveedor_id: proveedorId },
  });
  return respuesta.data;
};