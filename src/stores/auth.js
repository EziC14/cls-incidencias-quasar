import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: '',
    clave: '',
    loggedIn: false
  }),
  getters: {
    isAuthenticated: (state) => state.loggedIn
  },
  actions: {
    async login(usuario, clave) {
      const data = await window.electronAPI.dbLogin(usuario, clave)
      if (data.success) {
        this.usuario = usuario
        this.clave = clave
        this.loggedIn = true
        localStorage.setItem('auth', JSON.stringify({ usuario, clave }))
      }
      return data
    },
    logout() {
      this.usuario = ''
      this.clave = ''
      this.loggedIn = false
      localStorage.removeItem('auth')
    },
    restoreSession() {
      const stored = localStorage.getItem('auth')
      if (stored) {
        const { usuario, clave } = JSON.parse(stored)
        this.usuario = usuario
        this.clave = clave
        this.loggedIn = true
      }
    }
  }
})