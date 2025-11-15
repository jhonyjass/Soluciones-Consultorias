<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Historial de Ubicaciones
    </div>

    <q-table
      :rows="ubicaciones"
      :columns="columns"
      row-key="id"
      flat
      bordered
      no-data-label="No hay ubicaciones registradas"
    >
      <template #body-cell-acciones="props">
        <q-td :props="props" align="center">
          <q-btn dense flat round icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn dense flat round icon="delete" color="negative" @click="eliminar(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- MODAL EDICIÓN -->
    <q-dialog v-model="modalEditar" persistent>
      <q-card style="min-width: 520px; max-width: 95vw;">
        <q-card-section class="text-h6 text-primary">
          Editar Ubicación
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                v-model="editForm.departamento"
                :options="departamentos"
                label="Departamento"
                outlined
                @update:model-value="cargarMunicipios"
              />
            </div>

            <div class="col-6">
              <q-select
                v-model="editForm.municipio"
                :options="municipios"
                label="Municipio"
                outlined
              />
            </div>
          </div>

          <q-input v-model="editForm.comunidad" label="Comunidad" outlined />
        </q-card-section>

        <q-separator/>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" :loading="loadingEditar" label="Guardar" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { departamentosData } from 'src/data/departamentosMunicipios'

const $q = useQuasar()

// tabla
const ubicaciones = ref([])

const columns = [
  { name: 'departamento', label: 'Departamento', field: 'departamento', align: 'left' },
  { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'center' },
  { name: 'comunidad', label: 'Comunidad', field: 'comunidad', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

onMounted(async () => {
  try {
    const res = await api.get('Ubicaciones/historial')
    ubicaciones.value = res.data
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar ubicaciones' })
  }
})

// ===== EDICIÓN =====
const modalEditar = ref(false)
const loadingEditar = ref(false)

const departamentos = Object.keys(departamentosData)
const municipios = ref([])

const editForm = ref({
  id: null,
  departamento: '',
  municipio: '',
  comunidad: ''
})

function editar(row) {
  editForm.value = { ...row }
  cargarMunicipios(editForm.value.departamento)
  modalEditar.value = true
}

function cargarMunicipios(dep) {
  municipios.value = departamentosData[dep] || []
  if (!municipios.value.includes(editForm.value.municipio)) {
    editForm.value.municipio = ''
  }
}

async function guardarEdicion() {
  if (loadingEditar.value) return
  loadingEditar.value = true

  try {
    await api.put(`Ubicaciones/${editForm.value.id}`, editForm.value)

    const idx = ubicaciones.value.findIndex(u => u.id === editForm.value.id)
    if (idx >= 0) ubicaciones.value[idx] = { ...editForm.value }

    modalEditar.value = false
    $q.notify({ type: 'positive', message: 'Ubicación actualizada correctamente' })

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al actualizar ubicación' })
  }

  loadingEditar.value = false
}

// ===== ELIMINAR (activo = 0) =====
async function eliminar(id) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Desea eliminar esta ubicación?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`Ubicaciones/${id}`)
      ubicaciones.value = ubicaciones.value.filter(u => u.id !== id)
      $q.notify({ type: 'positive', message: 'Ubicación eliminada correctamente' })
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error al eliminar ubicación' })
    }
  })
}
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
