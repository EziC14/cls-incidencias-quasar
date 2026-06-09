<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">
          <q-icon name="mdi-hexagon-multiple" size="28px" style="color: #ef4444" />
        </div>
        <div class="login-title">MiApp</div>
        <div class="login-subtitle">Inicia sesión para continuar</div>
      </div>

      <q-form @submit="handleLogin" class="login-form">
        <q-input v-model="usuario" label="Usuario" outlined dark class="login-input" hide-bottom-space autofocus />
        <q-input v-model="clave" label="Contraseña" outlined dark class="login-input" hide-bottom-space :type="showPwd ? 'text' : 'password'">
          <template v-slot:append>
            <q-btn flat dense round :icon="showPwd ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" size="sm" class="text-grey-5" @click="showPwd = !showPwd" />
          </template>
        </q-input>

        <q-btn label="Ingresar" type="submit" unelevated class="login-btn" :loading="loading" no-caps />

        <div v-if="error" class="login-error">{{ error }}</div>
      </q-form>
    </div>
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
const showPwd = ref(false)

async function handleLogin() {
  if (!usuario.value || !clave.value) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(usuario.value, clave.value)
    router.push('/inc-corp/listar')
  } catch (err) {
    error.value = err.response?.data?.error || 'Usuario o contraseña incorrectos'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #1c1c1e;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: #2c2c2e;
  border-radius: 16px;
  padding: 40px 32px 32px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.login-subtitle {
  font-size: 13px;
  color: #8e8e93;
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    background: #3a3a3c !important;
  }
  :deep(.q-field__label) {
    color: #8e8e93;
    font-size: 13px;
  }
  :deep(.q-field__native) {
    color: #ffffff;
    font-size: 14px;
  }
}

.login-btn {
  height: 48px;
  border-radius: 10px;
  background: #ef4444 !important;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;

  &:hover {
    background: #dc2626 !important;
  }
}

.login-error {
  text-align: center;
  color: #ef4444;
  font-size: 13px;
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}
</style>
