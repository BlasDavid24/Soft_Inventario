import api from './client'

export const obtenerCategoriaApi = async (params = {}) => {
  const respuesta = await api.get('/categorias/filtrar', { params });
  return respuesta.data;
};
