import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('jwt');
      // Предполагается, что у вас есть доступ к history или другому способу навигации
      // window.location.href = '/connect-wallet';
      // Для React Router можно использовать useNavigate хук, но это нужно делать в компоненте
      // или передавать history сюда.
      // Пока что просто очистим токен.
      console.error('Unauthorized, redirecting to /connect-wallet');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 