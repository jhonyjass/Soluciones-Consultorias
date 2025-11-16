import axios from 'axios'

const api = axios.create({
  baseURL: 'https://soluciones-consultoriasapi-production.up.railway.app/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// ✅ Interceptor: obtiene el token del localStorage (no sessionStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear()
      if (!window.location.pathname.startsWith('/solconsa/login')) {
        window.location.href = '/solconsa/login'
      }
    }
    return Promise.reject(error)
  }
)

export { api }

export default ({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
}
