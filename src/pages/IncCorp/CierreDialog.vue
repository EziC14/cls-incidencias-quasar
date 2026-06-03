<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="text-h6">Cerrar Incidencia</q-card-section>

      <q-card-section class="q-gutter-md">
        <q-select v-model="tipoInc" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO"
          label="Tipo Incidencia Real" outlined emit-value map-options />
        <q-select v-model="tipoCierre" :options="store.tiposCierre" option-value="IDTIPO" option-label="DESCTIPO"
          label="Tipo Cierre" outlined emit-value map-options />
        <q-input v-model="motivo" label="Motivo de Cierre" outlined type="textarea" rows="3" />
        <q-input v-model="fecha" label="Fecha de Cierre" outlined type="date" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancelar" v-close-popup />
        <q-btn label="Guardar" color="primary" @click="guardar" :loading="guardando" />
      </q-card-actions>
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
