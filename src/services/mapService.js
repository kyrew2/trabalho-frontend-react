import axios from 'axios';

// Usar variável de ambiente para o URL base da API
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ripe-donella-atitus-fbbf314a.koyeb.app';
const API_POINT_URL = `${BASE_URL}/ws/point`;

// NOVO: Flag para ativar a API de dados simulados
const IS_MOCKING = import.meta.env.VITE_MOCK_API === 'true';

// Dados simulados
const MOCK_POINTS_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23A35E49">MOCK</text><rect x="5" y="5" width="90" height="90" fill="none" stroke="%23000000" stroke-width="2"/></svg>';

const MOCK_POINTS = [
  {
    id: 101,
    descricao: 'Ponto MOCK: Cachorro perdido',
    latitude: -23.54052,
    longitude: -46.623308,
    imageUrl: MOCK_POINTS_SVG
  },
  {
    id: 102,
    descricao: 'Ponto MOCK: Gato para adoção',
    latitude: -23.56552,
    longitude: -46.645308,
    imageUrl: MOCK_POINTS_SVG
  },
];

let dynamicMockPoints = [...MOCK_POINTS];

export async function getPoints(token) {
  if (IS_MOCKING) {
    console.log('MOCK API: Returning simulated points');
    // Retorna os pontos estáticos + os pontos adicionados dinamicamente
    const points = dynamicMockPoints.map(point => ({
      id: point.id,
      title: point.descricao,
      position: {
        lat: point.latitude,
        lng: point.longitude,
      },
      imageUrl: point.imageUrl,
    }));
    return new Promise((resolve) => setTimeout(() => resolve(points), 500));
  }

  try {
    const response = await axios.get(API_POINT_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const points = response.data.map(point => ({
      id: point.id,
      title: point.descricao,
      position: {
        lat: point.latitude,
        lng: point.longitude,
      },
      imageUrl: point.imageUrl,
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

export async function postPoint(token, pointData, isFormData = false) {
  if (IS_MOCKING) {
    console.log('MOCK API: Simulating new point creation');

    // Converte FormData para objeto para facilitar a leitura dos dados simulados
    const data = isFormData ? Object.fromEntries(pointData.entries()) : pointData;

    // NOVO: Gera uma imagem SVG local para o novo ponto
    const titleText = encodeURIComponent(data.descricao.split(' ')[0] || 'Novo');
    const newMockPoint = {
      id: Math.floor(Math.random() * 10000) + 200,
      descricao: data.descricao || 'Novo Ponto MOCK',
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      imageUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23A35E49">${titleText}</text><rect x="5" y="5" width="90" height="90" fill="none" stroke="%23000000" stroke-width="2"/></svg>`,
    };

    // Adiciona o novo ponto à lista dinâmica
    dynamicMockPoints.push(newMockPoint);

    return new Promise((resolve) => setTimeout(() => resolve(newMockPoint), 500));
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
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