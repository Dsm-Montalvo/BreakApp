import axios from 'axios';

const API_BASE_URL = 'http://192.168.50.232:3000/api';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      ...userData,
      plataforma: ['android']
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};