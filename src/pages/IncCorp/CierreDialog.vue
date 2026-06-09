<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 520px; border-radius: 14px">
      <q-card-section class="bg-primary text-white q-py-sm" style="border-radius: 14px 14px 0 0">
        <div class="row items-center">
          <q-icon name="mdi-check-circle" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Cerrar Incidencia</span>
          <q-space />
          <q-btn flat dense icon="mdi-close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md q-pb-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Tipo Incidencia Real</div>
            <q-select v-model="tipoInc" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" outlined dense hide-bottom />
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Fecha de Cierre</div>
            <q-input v-model="fecha" outlined dense type="date" hide-bottom />
          </div>
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Tipo Cierre</div>
          <q-select v-model="tipoCierre" :options="store.tiposCierre" option-value="IDTIPO" option-label="DESCTIPO" outlined dense clearable hide-bottom />
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Motivo de Cierre</div>
          <q-input v-model="motivo" outlined type="textarea" rows="3" dense hide-bottom />
        </div>
      </q-card-section>
      <q-card-section class="bg-grey-2 q-py-sm" style="border-radius: 0 0 14px 14px">
        <div class="row justify-end q-gutter-sm">
          <q-btn label="Cancelar" flat v-close-popup style="border-radius: 8px" no-caps />
          <q-btn label="Guardar" color="primary" unelevated @click="guardar" :loading="guardando" style="border-radius: 8px" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import { date, useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({ modelValue: Boolean, incidenciaId: [String, Number] })
const emit = defineEmits(['update:modelValue', 'saved'])

const store = useIncidentStore()
const auth = useAuthStore()
const visible = ref(props.modelValue)

const tipoInc = ref(null)
const tipoCierre = ref(null)
const motivo = ref('')
const fecha = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const guardando = ref(false)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })

onMounted(() => {
  store.loadTipos()
  store.loadTiposCierre()
})

async function guardar() {
  if (!tipoInc.value || !motivo.value) {
    $q.notify({ type: 'warning', message: 'Complete los campos requeridos' })
    return
  }
  guardando.value = true
  try {
    await store.cerrarIncidencia({
      id: props.incidenciaId,
      usuario: auth.usuario,
      fecha: fecha.value,
      motivo: motivo.value,
      tipo: tipoInc.value,
      tipcierre: tipoCierre.value
    })
    emit('saved')
    visible.value = false
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cerrar incidencia' })
  } finally {
    guardando.value = false
  }
}
</script>
