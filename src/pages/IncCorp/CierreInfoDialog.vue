<template>
  <q-dialog v-model="visible">
    <q-card style="min-width: 520px; border-radius: 14px">
      <q-card-section class="bg-secondary text-white q-py-sm" style="border-radius: 14px 14px 0 0; cursor: move" @mousedown.prevent="onHeaderMouseDown">
        <div class="row items-center">
          <q-icon name="mdi-check-circle" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Datos de Cierre</span>
          <q-space />
          <q-btn flat dense icon="mdi-close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md q-pb-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Tipo Cierre Real</div>
            <q-input :model-value="incidencia?.DESCTIPOCIERRE || incidencia?.TIPINCDREAL || '—'" outlined dense readonly hide-bottom />
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Fecha Cierre</div>
            <q-input :model-value="incidencia?.FECHCIERRE ? `${String(incidencia.FECHCIERRE).substring(6,8)}/${String(incidencia.FECHCIERRE).substring(4,6)}/${String(incidencia.FECHCIERRE).substring(0,4)}` : '—'" outlined dense readonly hide-bottom />
          </div>
        </div>
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Usuario Cierre</div>
            <q-input :model-value="incidencia?.USUARIOMOD || '—'" outlined dense readonly hide-bottom />
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Fecha Modificación</div>
            <q-input :model-value="incidencia?.FECHAMOD ? `${String(incidencia.FECHAMOD).substring(6,8)}/${String(incidencia.FECHAMOD).substring(4,6)}/${String(incidencia.FECHAMOD).substring(0,4)}` : '—'" outlined dense readonly hide-bottom />
          </div>
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Motivo Cierre</div>
          <q-input :model-value="incidencia?.MOTCIERRE || '—'" outlined dense readonly type="textarea" rows="3" hide-bottom />
        </div>
      </q-card-section>
      <q-card-section class="bg-grey-2 q-py-sm" style="border-radius: 0 0 14px 14px">
        <div class="row justify-end">
          <q-btn label="Cerrar" color="secondary" unelevated v-close-popup style="border-radius: 8px" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDraggable } from 'src/composables/useDraggable'

const props = defineProps({ modelValue: Boolean, incidencia: Object })
const emit = defineEmits(['update:modelValue'])
const { onHeaderMouseDown } = useDraggable()
const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })
</script>
