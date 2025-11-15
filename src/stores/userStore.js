import { defineStore } from 'pinia'
import axios from 'axios' // o tu boot axios


export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    idUsuario: localStorage.getItem('idUsuario') || null,
    nombreUsuario: localStorage.getItem('nombreUsuario') || '',
    rolUsuario: localStorage.getItem('rolUsuario') || ''
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login({ email, contrasena }) {
      try {
        const { data } = await axios.post('https://localhost:7118/api/Auth/login', { email, contrasena })

        const token = data?.token || data?.result?.token
        const usuario = data?.usuario || data?.user || {}

        if (!token) throw new Error('No se recibió token')

        // ⚡ Guarda los datos
        this.token = token
        this.idUsuario = usuario.id || usuario.idUsuario || usuario.usuarioId || null
        this.nombreUsuario = usuario.nombre || 'Usuario'
        this.rolUsuario = usuario.rol || 'Usuario'

        // ⚡ Guarda en localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('idUsuario', this.idUsuario)
        localStorage.setItem('nombreUsuario', this.nombreUsuario)
        localStorage.setItem('rolUsuario', this.rolUsuario)

        axios.defaults.headers.common.Authorization = `Bearer ${token}`
        return true
      } catch (err) {
        console.error('Error en login:', err.response?.data || err.message)
        this.logout()
        throw err
      }
    },

    logout() {
  this.token = null
  this.idUsuario = null
  this.nombreUsuario = ''
  this.rolUsuario = ''
  localStorage.clear()
  delete axios.defaults.headers.common.Authorization

  window.location.href = '/solconsa/login'
}
  }
})
