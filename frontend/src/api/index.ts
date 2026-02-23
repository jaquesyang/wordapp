/**
 * API 请求配置
 */
import axios, { type AxiosInstance } from "axios";

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// 创建一个类型化的 API 实例，自动返回 response.data
type ApiInstance = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> & {
  get: <T>(url: string, config?: any) => Promise<T>;
  post: <T>(url: string, data?: any, config?: any) => Promise<T>;
  put: <T>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T>(url: string, config?: any) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: any) => Promise<T>;
};

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 响应拦截器 - 返回 response.data
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API 请求失败:", error);
    return Promise.reject(error);
  }
);

export const api = axiosInstance as ApiInstance;

// 导出默认配置供其他模块使用
export const { defaults } = axiosInstance;

export default api;
