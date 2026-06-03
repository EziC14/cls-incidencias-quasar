<template>
  <div class="login-container">
    <q-card class="login-card">
      <q-card-section class="text-center q-pa-lg">
        <q-icon name="mdi-shield-account" size="64px" color="primary" />
        <div class="text-h5 q-mt-md text-primary">Módulo Incidencias</div>
        <div class="text-caption text-grey">Ingrese sus credenciales</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input v-model="usuario" label="Usuario" outlined autofocus
            :rules="[v => !!v || 'Usuario requerido']"
            @keyup.enter="handleLogin">
            <template v-slot:prepend><q-icon name="mdi-account" /></template>
          </q-input>

          <q-input v-model="clave" label="Contraseña" outlined type="password"
            :rules="[v => !!v || 'Contraseña requerida']"
            @keyup.enter="handleLogin">
            <template v-slot:prepend><q-icon name="mdi-lock" /></template>
          </q-input>

          <q-btn label="Acceder" type="submit" color="primary" class="full-width" :loading="loading" />
        </q-form>
      </q-card-section>

      <q-card-section v-if="error" class="q-pt-none">
        <q-banner class="bg-negative text-white">
          {{ error }}
        </q-banner>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()
const usuario = ref('')
const clave = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!usuario.value || !clave.value) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(usuario.value, clave.value)
    router.push('/menu')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}
.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
