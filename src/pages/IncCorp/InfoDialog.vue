<template>
  <q-dialog v-model="visible">
    <q-card style="min-width: 500px">
      <q-card-section class="text-h6">Información Adicional</q-card-section>

      <q-card-section>
        <q-input :value="incidencia?.NOMCONTACTO" label="Nombre Contacto" outlined dense readonly />
        <q-input :value="incidencia?.DIRECCONT" label="Dirección" outlined dense readonly class="q-mt-sm" />
        <q-input :value="incidencia?.NUMTLFO" label="Teléfono" outlined dense readonly class="q-mt-sm" />
        <q-input :value="incidencia?.EMAILCONT" label="Email" outlined dense readonly class="q-mt-sm" />
        <q-input :value="incidencia?.COMENTARIO" label="Motivo" outlined dense readonly type="textarea" rows="3" class="q-mt-sm" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cerrar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: Boolean, incidencia: Object, detalles: Array })
const emit = defineEmits(['update:modelValue'])
const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })
</script>