import api from './client'

export const obtenerProveedoresApi = async () => {
  const respuesta = await api.get('/proveedor/filtrar');
  return respuesta.data;
};

export const obtenerProductosPorProveedorApi = async (proveedorId) => {
  const respuesta = await api.get('/proveedor-producto/filtrar', {
    params: { proveedor_id: proveedorId },
  });
  return respuesta.data;
};

export const crearProveedorApi = async (datosProveedor) => {
  const respuesta = await api.post('/proveedor/crear', datosProveedor);
  return respuesta.data;
};

export const actualizarProveedorApi = async (proveedorId, datosProveedoresAct) => {
  const respuesta = await api.put(`/proveedor/editar/${proveedorId}`, datosProveedoresAct);
  return respuesta.data;
};

export const desactivarProveedorApi = async (proveedorId, nuevoEstado) => {
  const respuesta = await api.patch(`/proveedor/desactivar/${proveedorId}`, {
    activo: nuevoEstado,
  });
  return respuesta.data;
};

