import axios from 'axios';

// Usar variável de ambiente para o URL base da API (Tarefa 2)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ripe-donella-atitus-fbbf314a.koyeb.app';
const API_POINT_URL = `${BASE_URL}/ws/point`;

// ... (getPoints permanece o mesmo)

export async function postPoint(token, pointData, isFormData = false) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Se for FormData, definimos o Content-Type como undefined para o Axios configurar corretamente
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  } else {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await axios.post(API_POINT_URL, pointData, {
      headers,
    });

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error('Erro ao cadastrar ponto');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao cadastrar ponto');
  }
}