<template>
  <q-dialog v-model="visible" maximized>
    <q-card>
      <q-card-section class="text-h6">Buscar Cliente</q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-sm q-mb-md">
          <q-input v-model="codigo" label="Código" outlined dense class="col-4" @keyup.enter="buscar" />
          <q-input v-model="nombre" label="Nombre" outlined dense class="col-4" @keyup.enter="buscar" />
          <q-btn label="Buscar" color="primary" icon="mdi-magnify" @click="buscar" class="col-2" />
        </div>
        <q-table :rows="clientes" :columns="columns" row-key="CLCODI" dense flat bordered @row-click="seleccionar" />
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
const clientes = ref([])
const columns = [
  { name: 'CLCODI', label: 'Código', field: 'CLCODI', sortable: true },
  { name: 'CLNOMB', label: 'Nombre', field: 'CLNOMB', sortable: true },
]

async function buscar() {
  try {
    const q = codigo.value || nombre.value
    let sql = "SELECT * FROM SPEED400CS.TCLIE WHERE 1=1"
    const params = []
    if (q) { sql += " AND (CLNOMB LIKE ? OR CLCODI LIKE ?)"; params.push(`%${q}%`, `%${q}%`) }
    sql += " FETCH FIRST 100 ROWS ONLY"
    clientes.value = await window.electronAPI.dbQuery(sql, params, auth.usuario, auth.clave)
  } catch {}
}

function seleccionar(evt, row) {
  emit('select', row)
  visible.value = false
}
</script>