<template>
  <q-page padding>

    <!-- HEADER DEL MÓDULO -->
    <ModuloHeader titulo="Historial de Registros" icono="history" />

    <q-card class="q-pa-md q-mt-md">

      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        separator="horizontal"
      >

        <!-- BUSCADOR -->
        <template #top-right>
          <q-input
            dense
            debounce="300"
            v-model="filtro"
            placeholder="Buscar..."
            outlined
            clearable
            class="q-ml-sm"
            style="width: 240px"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </template>

        <!-- ESTADO NUTRICIONAL -->
        <template #body-cell-estadoNutricional="props">
          <q-td :props="props">
            <q-chip
              square
              :color="colorEstado(props.row.estadoNutricional)"
              text-color="white"
              class="text-weight-medium"
            >
              {{ props.row.estadoNutricional }}
            </q-chip>
          </q-td>
        </template>

        <!-- FECHA -->
        <template #body-cell-fechaRegistro="props">
          <q-td :props="props">
            {{ new Date(props.row.fechaRegistro).toLocaleDateString() }}
          </q-td>
        </template>

      </q-table>

    </q-card>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import ModuloHeader from 'src/components/ModuloHeader.vue'

const $q = useQuasar()

const registros = ref([])
const filtro = ref('')
const loading = ref(false)

const columns = [
  { name: 'nombre', label: 'Nombre del niño', field: 'nombre', align: 'left', sortable: true },
  { name: 'edadAnios', label: 'Edad (años)', field: 'edadAnios', align: 'center' },
  { name: 'peso', label: 'Peso (kg)', field: 'peso', align: 'center' },
  { name: 'talla', label: 'Talla (cm)', field: 'talla', align: 'center' },
  { name: 'estadoNutricional', label: 'Estado Nutricional', field: 'estadoNutricional', align: 'center' },
  { name: 'departamento', label: 'Departamento', field: 'departamento', align: 'center' },
  { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'center' },
  { name: 'fechaRegistro', label: 'Fecha de Registro', field: 'fechaRegistro', align: 'center', sortable: true }
]

// Cargar historial
onMounted(async () => {
  try {
    loading.value = true
    const res = await api.get('Ninos/historial')
    registros.value = res.data || []
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar historial' })
  } finally {
    loading.value = false
  }
})

// Colores de chips
function colorEstado(estado) {
  switch (estado) {
    case 'Desnutrición': return 'negative'
    case 'Riesgo': return 'warning'
    case 'Normal': return 'positive'
    case 'Sobrepeso': return 'orange'
    case 'Obesidad': return 'deep-purple'
    default: return 'grey'
  }
}

// Filtro
const filteredRows = computed(() => {
  if (!filtro.value) return registros.value
  const term = filtro.value.toLowerCase()
  return registros.value.filter(r =>
    r.nombre.toLowerCase().includes(term) ||
    r.estadoNutricional.toLowerCase().includes(term) ||
    r.departamento.toLowerCase().includes(term)
  )
})
</script>

<style scoped>
.q-chip {
  min-width: 110px;
  justify-content: center;
}
</style>
