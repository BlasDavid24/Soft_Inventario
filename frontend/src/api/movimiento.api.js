import api from './client'

export const obtenerMovimientosApi = async () => {
  const respuesta = await api.get('/movimientos/filtrar');
  return respuesta.data;
};

export const obtenerMovimientoPorIdApi = async (id) => {
  const response = await api.get(`/movimientos/filtrar/${id}`);
  return response.data;
};