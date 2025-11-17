import axios from 'axios';

// Usar uma variável de ambiente para o URL base da API
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ripe-donella-atitus-fbbf314a.koyeb.app';
const API_POINT_URL = `${BASE_URL}/ws/point`; // Endpoint de pontos

export async function getPoints(token) {
  try {
    const response = await axios.get(API_POINT_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // o objeto response.data possui os campos latitude e longitude mas precisamos mudar os nomes para lat lng
    const points = response.data.map(point => ({
      id: point.id,
      title: point.descricao,
      position: {
        lat: point.latitude,
        lng: point.longitude,
      },
    }));

    if (response.status === 200) {
      return points;
    } else {
      throw new Error('Erro ao buscar pontos');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar pontos');
  }
}

export async function postPoint(token, pointData) {
  try {
    const response = await axios.post(API_POINT_URL, pointData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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