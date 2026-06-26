import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: '',
    clave: '',
    loggedIn: false,
    isAdmin: false
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
        await this._checkAdmin()
        localStorage.setItem('auth', JSON.stringify({ usuario, clave, isAdmin: this.isAdmin }))
      }
      return data
    },
    async _checkAdmin() {
      try {
        const rows = await window.electronAPI.dbQuery(
          "SELECT COUNT(*) AS C FROM CLS.TADMIN WHERE USUARIO = ?",
          [this.usuario], this.usuario, this.clave
        )
        this.isAdmin = Number(rows[0].C) > 0
      } catch {
        this.isAdmin = false
      }
    },
    logout() {
      this.usuario = ''
      this.clave = ''
      this.loggedIn = false
      this.isAdmin = false
      localStorage.removeItem('auth')
    },
    restoreSession() {
      const stored = localStorage.getItem('auth')
      if (stored) {
        const { usuario, clave, isAdmin } = JSON.parse(stored)
        this.usuario = usuario
        this.clave = clave
        this.loggedIn = true
        this.isAdmin = !!isAdmin
      }
    }
  }
})
