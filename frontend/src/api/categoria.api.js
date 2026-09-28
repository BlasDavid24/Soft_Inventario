import api from './client'

export const obtenerCategoriaApi = async (params = {}) => {
  const respuesta = await api.get('/categorias/filtrar', { params });
  return respuesta.data;
};

export const crearCategoriaApi = async (datosCategoria) => {
  const respuesta = await api.post('/categorias/crear', datosCategoria);
  return respuesta.data;
};

export const actualizarCategoriaApi = async (id, datosCategoria) => {
  const respuesta = await api.put(`/categorias/editar/${id}`, datosCategoria);
  return respuesta.data;
};
