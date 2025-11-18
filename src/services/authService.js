import axios from 'axios';

// Usar variável de ambiente para o URL base da API (Tarefa 2)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ripe-donella-atitus-fbbf314a.koyeb.app';
const API_URL = `${BASE_URL}/auth`;

export async function signIn(email, password) {
  try {
    const response = await axios.post(`${API_URL}/signin`, { email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('Requisição inválida.');
      }
      if (error.response.status === 401) {
        throw new Error('Usuário ou senha incorretos.');
      }
    }
    throw new Error('Erro ao autenticar.');
  }
}

export async function signUp(name, email, password) {
  try {
    const response = await axios.post(`${API_URL}/signup`, { name, email, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('Requisição inválida.');
      }
      if (error.response.status === 409) {
        throw new Error('Usuário já cadastrado.');
      }
    }
    throw new Error('Erro ao cadastrar usuário.');
  }
}