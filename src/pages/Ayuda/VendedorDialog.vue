<template>
  <q-dialog v-model="visible" maximized>
    <q-card>
      <q-card-section class="text-h6">Buscar Vendedor</q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-sm q-mb-md">
          <q-input v-model="codigo" label="Código" outlined dense class="col-4" @keyup.enter="buscar" />
          <q-input v-model="nombre" label="Nombre" outlined dense class="col-4" @keyup.enter="buscar" />
          <q-btn label="Buscar" color="primary" icon="mdi-magnify" @click="buscar" class="col-2" />
        </div>
        <q-table :rows="vendedores" :columns="columns" row-key="AGECVE" dense flat bordered @row-click="seleccionar" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Cerrar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from 'stores/auth'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'select'])
const auth = useAuthStore()
const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })

const codigo = ref('')
const nombre = ref('')
const vendedores = ref([])
const columns = [
  { name: 'AGECVE', label: 'Código', field: 'AGECVE', sortable: true },
  { name: 'AGENOM', label: 'Nombre', field: 'AGENOM', sortable: true },
]

async function buscar() {
  try {
    const q = codigo.value || nombre.value
    let sql = `SELECT AGECVE, AGENOM, TBALF2 AS CANAL
               FROM SPEED400CS.TAGEN
               INNER JOIN SPEED400CS.TTABD ON TBALF1 = AGECVE AND TBIDEN = 'CNVEN'`
    const params = []
    if (q) { sql += " WHERE (AGENOM LIKE ? OR AGECVE LIKE ?)"; params.push(`%${q}%`, `%${q}%`) }
    vendedores.value = await window.electronAPI.dbQuery(sql, params, auth.usuario, auth.clave)
  } catch {}
}

function seleccionar(evt, row) {
  emit('select', row)
  visible.value = false
}
</script>