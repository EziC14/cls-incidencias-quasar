<template>
  <q-dialog v-model="visible">
    <q-card style="min-width: 520px; border-radius: 14px">
      <q-card-section class="bg-primary text-white q-py-sm" style="border-radius: 14px 14px 0 0; cursor: move" @mousedown.prevent="onHeaderMouseDown">
        <div class="row items-center">
          <q-icon name="mdi-information-outline" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Información Adicional</span>
          <q-space />
          <q-btn flat dense icon="mdi-close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md q-pb-sm">
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Nombre Contacto</div>
            <q-input :model-value="incidencia?.NOMCONTACTO" outlined dense readonly hide-bottom />
          </div>
          <div class="col-6">
            <div class="text-caption text-grey-7 q-mb-xs">Teléfono</div>
            <q-input :model-value="incidencia?.NUMTLFO" outlined dense readonly hide-bottom />
          </div>
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Dirección</div>
          <q-input :model-value="incidencia?.DIRECCONT" outlined dense readonly hide-bottom />
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Email</div>
          <q-input :model-value="incidencia?.EMAILCONT" outlined dense readonly hide-bottom />
        </div>
        <div class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Motivo / Comentario</div>
          <q-input :model-value="incidencia?.COMENTARIO" outlined dense readonly type="textarea" rows="3" hide-bottom />
        </div>
      </q-card-section>
      <q-card-section class="bg-grey-2 q-py-sm" style="border-radius: 0 0 14px 14px">
        <div class="row justify-end">
          <q-btn label="Cerrar" color="primary" unelevated v-close-popup style="border-radius: 8px" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDraggable } from 'src/composables/useDraggable'

const props = defineProps({ modelValue: Boolean, incidencia: Object, detalles: Array })
const emit = defineEmits(['update:modelValue'])
const { onHeaderMouseDown } = useDraggable()
const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })
</script>
