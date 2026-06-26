<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 700px; max-width: 800px">
      <q-card-section class="bg-primary text-white q-py-sm" style="cursor: move" @mousedown.prevent="onHeaderMouseDown">
        <div class="row items-center">
          <q-icon name="mdi-account-search" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Buscar Cliente</span>
          <q-space />
          <q-btn flat dense icon="mdi-close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-sm q-pb-md">
        <div class="row q-col-gutter-sm q-mb-md items-end">
          <q-input v-model="codigo" label="Código" outlined dense class="col-4" @keyup.enter="buscar" hide-bottom />
          <q-input v-model="nombre" label="Nombre" outlined dense class="col-4" @keyup.enter="buscar" hide-bottom />
          <div class="col-2">
            <div class="text-caption text-grey-7">&nbsp;</div>
            <q-btn color="primary" icon="mdi-magnify" @click="buscar" class="full-width" unelevated style="height: 40px" />
          </div>
          <div class="col-2">
            <div class="text-caption text-grey-7">&nbsp;</div>
            <q-btn label="Limpiar" outline color="grey-7" @click="limpiar" class="full-width" style="height: 40px" />
          </div>
        </div>
        <q-table :rows="clientes" :columns="columns" row-key="CLICVE" dense flat bordered
          :rows-per-page-options="[10, 20, 50]" :loading="buscando"
          @row-click="seleccionar"
          no-data-label="Ingrese criterios de búsqueda">
          <template v-slot:body-cell-CLICVE="props">
            <q-td><span class="text-weight-medium">{{ props.value }}</span></q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useDraggable } from 'src/composables/useDraggable'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'select'])
const auth = useAuthStore()
const { onHeaderMouseDown } = useDraggable()
const visible = ref(props.modelValue)

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => { emit('update:modelValue', v) })

const codigo = ref('')
const nombre = ref('')
const clientes = ref([])
const buscando = ref(false)
const columns = [
  { name: 'CLICVE', label: 'Código', field: 'CLICVE', sortable: true, align: 'left' },
  { name: 'CLINOM', label: 'Nombre', field: 'CLINOM', sortable: true },
]

async function buscar() {
  buscando.value = true
  try {
    const q = (codigo.value || nombre.value).toUpperCase()
    let sql = "SELECT CLICVE, CLINOM FROM SPEED400CS.TCLIE WHERE CLISIT = '01'"
    const params = []
    if (q) { sql += " AND (UCASE(CLINOM) LIKE ? OR UCASE(CLICVE) LIKE ?)"; params.push(`%${q}%`, `%${q}%`) }
    sql += " FETCH FIRST 100 ROWS ONLY"
    clientes.value = await window.electronAPI.dbQuery(sql, params, auth.usuario, auth.clave)
  } catch {}
  buscando.value = false
}

function limpiar() {
  codigo.value = ''
  nombre.value = ''
  clientes.value = []
}

function seleccionar(evt, row) {
  emit('select', row)
  visible.value = false
}
</script>
