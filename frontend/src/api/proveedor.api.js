import api from './client'

export const obtenerProveedoresApi = async () => {
  const respuesta = await api.get('/proveedor/filtrar');
  return respuesta.data;
};

export const crearProveedorApi = async (datosProveedor) => {
  const respuesta = await api.post('/proveedor/crear', datosProveedor);
  return respuesta.data;
};

export const desactivarProveedorApi = async (proveedorId) => {
  const respuesta = await api.patch(`/proveedor/desactivar/${proveedorId}`);
  return respuesta.data;
};


