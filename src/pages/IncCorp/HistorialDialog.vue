<template>
  <q-dialog v-model="visible">
    <q-card class="chat-card">

      <!-- Header -->
      <div class="chat-header">
        <div class="header-left">
          <div class="header-icon">
            <q-icon name="mdi-chat-processing" size="18px" color="white" />
          </div>
          <div>
            <div class="header-title">Historial de Comentarios</div>
            <div class="header-sub">INCD-{{ String(incidencia?.ID || '').padStart(4, '0') }}</div>
          </div>
        </div>
        <q-btn flat round dense icon="mdi-close" color="white" v-close-popup size="sm" />
      </div>

      <!-- Mensajes -->
      <q-scroll-area ref="scrollArea" class="chat-body">
        <!-- Empty state -->
        <div v-if="comentarios.length === 0" class="empty-state">
          <div class="empty-icon">
            <q-icon name="mdi-chat-outline" size="32px" color="grey-4" />
          </div>
          <div class="empty-title">Sin comentarios aún</div>
          <div class="empty-sub">Sé el primero en escribir</div>
        </div>

        <!-- Bubbles -->
        <div
          v-for="c in comentarios"
          :key="c.ID"
          class="bubble-row"
          :class="esMio(c) ? 'bubble-row--mine' : 'bubble-row--other'"
        >
          <!-- Avatar -->
          <div class="bubble-avatar" :class="esMio(c) ? 'bubble-avatar--mine' : ''">
            {{ c.USUARIO?.charAt(0)?.toUpperCase() }}
          </div>

          <div class="bubble-content" :class="esMio(c) ? 'bubble-content--mine' : ''">
            <!-- Meta -->
            <div class="bubble-meta" :class="esMio(c) ? 'bubble-meta--mine' : ''">
              <span class="bubble-user">{{ c.USUARIO }}</span>
              <span class="bubble-time">
                {{ fmtFecha(c.FECHA) }}
                {{ c.HORA ? String(c.HORA).padStart(6, '0').replace(/(..)(..)(..)/, '$1:$2:$3') : '' }}
              </span>
            </div>
            <!-- Texto -->
            <div class="bubble" :class="esMio(c) ? 'bubble--mine' : 'bubble--other'">
              {{ c.COMENTARIO }}
            </div>
          </div>
        </div>

        <!-- Spacer final -->
        <div style="height: 8px" />
      </q-scroll-area>

      <!-- Input -->
      <div class="chat-input-area">
        <div class="chat-input-wrap">
          <q-input
            v-model="nuevoComentario"
            outlined
            dense
            type="textarea"
            :rows="1"
            placeholder="Escribe un comentario..."
            maxlength="500"
            hide-bottom
            autogrow
            class="chat-input"
            @keydown.enter.prevent.exact="enviar"
          />
          <q-btn
            round
            unelevated
            :loading="enviando"
            :disable="!nuevoComentario.trim()"
            @click="enviar"
            icon="mdi-send"
            size="md"
            class="send-btn"
          />
        </div>
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useIncidentStore } from 'src/stores/incident'
import { fmtFecha } from 'src/helpers/format'

const props = defineProps({ modelValue: Boolean, incidencia: Object })
const emit = defineEmits(['update:modelValue'])
const $q = useQuasar()
const store = useIncidentStore()
const auth = useAuthStore()

const visible = ref(props.modelValue)
const scrollArea = ref(null)
const comentarios = ref([])
const nuevoComentario = ref('')
const enviando = ref(false)

watch(() => props.modelValue, (v) => {
  visible.value = v
  if (v && props.incidencia) cargarComentarios()
})
watch(visible, (v) => { emit('update:modelValue', v) })

function esMio(c) {
  return c.USUARIO === auth.usuario
}

async function cargarComentarios() {
  if (!props.incidencia?.ID) return
  try {
    comentarios.value = await store.obtenerComentarios(props.incidencia.ID)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar comentarios', timeout: 3000 })
  }
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (scrollArea.value) {
    const el = scrollArea.value.$el.querySelector('.q-scrollarea__container')
    if (el) el.scrollTop = el.scrollHeight
  }
}

async function enviar() {
  if (!nuevoComentario.value.trim()) return
  enviando.value = true
  try {
    await store.agregarComentario(props.incidencia.ID, nuevoComentario.value.trim(), auth.usuario)
    nuevoComentario.value = ''
    await cargarComentarios()
  } finally {
    enviando.value = false
  }
}
</script>

<style lang="sass" scoped>
// ── Card ─────────────────────────────────────────────
.chat-card
  display: flex
  flex-direction: column
  width: 720px
  height: 65vh
  max-height: 700px
  background: #f4f4f8
  border-radius: 14px !important

// ── Header ───────────────────────────────────────────
.chat-header
  display: flex
  align-items: center
  justify-content: space-between
  padding: 12px 16px
  background: #2e7d32
  flex-shrink: 0

.header-left
  display: flex
  align-items: center
  gap: 12px

.header-icon
  width: 36px
  height: 36px
  border-radius: 10px
  background: rgba(255,255,255,0.15)
  display: flex
  align-items: center
  justify-content: center

.header-title
  font-size: 14px
  font-weight: 700
  color: white
  line-height: 1.2

.header-sub
  font-size: 11px
  color: rgba(255,255,255,0.7)
  font-weight: 500
  letter-spacing: 0.3px

// ── Chat body ────────────────────────────────────────
.chat-body
  flex: 1
  padding: 16px 20px

// ── Empty state ──────────────────────────────────────
.empty-state
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  height: 300px
  gap: 8px

.empty-icon
  width: 64px
  height: 64px
  border-radius: 50%
  background: #efefef
  display: flex
  align-items: center
  justify-content: center

.empty-title
  font-size: 14px
  font-weight: 600
  color: #9e9e9e

.empty-sub
  font-size: 12px
  color: #bdbdbd

// ── Bubble row ───────────────────────────────────────
.bubble-row
  display: flex
  align-items: flex-end
  gap: 8px
  margin-bottom: 12px

.bubble-row--mine
  flex-direction: row-reverse

// ── Avatar ───────────────────────────────────────────
.bubble-avatar
  width: 30px
  height: 30px
  min-width: 30px
  border-radius: 50%
  background: #e0e0e0
  color: #555
  font-size: 12px
  font-weight: 700
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0

.bubble-avatar--mine
  background: #2e7d32
  color: white

// ── Bubble content ───────────────────────────────────
.bubble-content
  display: flex
  flex-direction: column
  max-width: 65%
  min-width: 0

.bubble-content--mine
  align-items: flex-end

// ── Meta ─────────────────────────────────────────────
.bubble-meta
  display: flex
  align-items: center
  gap: 6px
  margin-bottom: 3px
  padding: 0 4px

.bubble-meta--mine
  flex-direction: row-reverse

.bubble-user
  font-size: 11px
  font-weight: 700
  color: #555

.bubble-time
  font-size: 10px
  color: #aaa

// ── Bubble ───────────────────────────────────────────
.bubble
  padding: 9px 13px
  border-radius: 16px
  font-size: 13px
  line-height: 1.5
  white-space: pre-wrap
  word-break: break-word

.bubble--other
  background: white
  color: #2d2d2d
  border-bottom-left-radius: 4px
  box-shadow: 0 1px 3px rgba(0,0,0,0.07)

.bubble--mine
  background: #2e7d32
  color: white
  border-bottom-right-radius: 4px
  box-shadow: 0 1px 3px rgba(46,125,50,0.3)

// ── Input area ───────────────────────────────────────
.chat-input-area
  flex-shrink: 0
  padding: 10px 16px 12px
  background: white
  border-top: 1px solid rgba(0,0,0,0.08)

.chat-input-wrap
  display: flex
  align-items: flex-end
  gap: 10px

.chat-input
  flex: 1

  :deep(.q-field__control)
    border-radius: 20px !important
    background: #f4f4f8

  :deep(textarea)
    padding: 8px 4px !important
    max-height: 120px

.send-btn
  background: #2e7d32 !important
  color: white !important
  flex-shrink: 0
  margin-bottom: 2px

  &:disabled
    background: #e0e0e0 !important
    color: #aaa !important

.input-hint
  font-size: 10px
  color: #bbb
  text-align: center
  margin-top: 5px
</style>