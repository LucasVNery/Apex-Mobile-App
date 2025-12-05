import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 segundos

/**
 * Interface para resposta padrão da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Interface para erros da API
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Cria uma instância do axios com configurações padrão
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Interceptor de requisição - adiciona token de autenticação
  instance.interceptors.request.use(
    async (config) => {
      try {
        // Se você estiver usando Clerk, pode pegar o token assim:
        // const token = await getToken(); // função do Clerk
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        // Por enquanto, vamos deixar preparado para adicionar o token
        const token = null; // Substitua pela lógica de obter token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Erro ao obter token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de resposta - trata erros globalmente
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: 'Erro desconhecido',
        status: error.response?.status,
      };

      if (error.response) {
        // Erro de resposta do servidor
        const data = error.response.data as any;
        apiError.message = data?.message || data?.error || 'Erro no servidor';
        apiError.details = data?.details;
        apiError.code = data?.code;
      } else if (error.request) {
        // Requisição foi feita mas sem resposta
        apiError.message = 'Sem resposta do servidor';
      } else {
        // Erro ao configurar a requisição
        apiError.message = error.message || 'Erro ao fazer requisição';
      }

      console.error('API Error:', apiError);
      return Promise.reject(apiError);
    }
  );

  return instance;
};

/**
 * Instância global do axios
 */
export const apiClient = createAxiosInstance();

/**
 * Helper para fazer requisições GET
 */
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Helper para fazer requisições POST
 */
export const post = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Helper para fazer requisições PUT
 */
export const put = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Helper para fazer requisições PATCH
 */
export const patch = async <T = any, D = any>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Helper para fazer requisições DELETE
 */
export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

/**
 * Configura o token de autenticação
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Limpa o token de autenticação
 */
export const clearAuthToken = () => {
  setAuthToken(null);
};

export default apiClient;
