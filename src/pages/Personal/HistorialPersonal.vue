<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Historial de Personal
    </div>

    <q-table
      :rows="registros"
      :columns="columns"
      row-key="id"
      flat
      bordered
      no-data-label="No hay registros disponibles"
    >
      <template #body-cell-acciones="props">
        <q-td :props="props" align="center">
          <q-btn
            dense
            flat
            round
            icon="edit"
            color="primary"
            @click="editar(props.row)"
          />
          <q-btn
            dense
            flat
            round
            icon="delete"
            color="negative"
            @click="eliminar(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- MODAL EDICIÓN -->
    <q-dialog v-model="modalEditar" persistent>
      <q-card style="min-width: 520px; max-width: 95vw;">
        <q-card-section class="text-h6 text-primary">
          Editar Personal
        </q-card-section>
        <q-separator />

        <q-card-section class="q-gutter-sm">
          <q-input v-model="editForm.nombre" label="Nombre completo" outlined />
          <q-input v-model="editForm.cargo" label="Cargo" outlined />
          <q-input v-model="editForm.contacto" label="Contacto / Teléfono" outlined />
          <q-input v-model="editForm.idioma" label="Idioma" outlined />
          <q-input v-model="editForm.residencia" label="Residencia" outlined />

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
        </q-card-section>

        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarEdicion" />
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
const registros = ref([])
const modalEditar = ref(false)
const departamentos = Object.keys(departamentosData)
const municipios = ref([])
const loadingGuardar = ref(false)
const loadingEliminar = ref(false)

const editForm = ref({
  id: null,
  nombre: '',
  cargo: '',
  contacto: '',
  idioma: '',
  residencia: '',
  departamento: '',
  municipio: ''
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'cargo', label: 'Cargo', field: 'cargo', align: 'center' },
  { name: 'contacto', label: 'Contacto', field: 'contacto', align: 'center' },
  { name: 'idioma', label: 'Idioma', field: 'idioma', align: 'center' },
  { name: 'departamento', label: 'Departamento', field: 'departamento', align: 'center' },
  { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'center' },
  { name: 'residencia', label: 'Residencia', field: 'residencia', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Cargar registros del backend
onMounted(async () => {
  try {
    const res = await api.get('Personal/historial')
    registros.value = res.data
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar historial' })
  }
})

function editar (row) {
  editForm.value = { ...row }
  cargarMunicipios(editForm.value.departamento)
  modalEditar.value = true
}

function cargarMunicipios (dep) {
  municipios.value = departamentosData[dep] || []
  if (!municipios.value.includes(editForm.value.municipio)) {
    editForm.value.municipio = ''
  }
}

async function guardarEdicion () {
  if (loadingGuardar.value) return
  loadingGuardar.value = true
  try {
    await api.put(`Personal/${editForm.value.id}`, editForm.value)
    const idx = registros.value.findIndex(r => r.id === editForm.value.id)
    if (idx >= 0) registros.value[idx] = { ...editForm.value }
    modalEditar.value = false
    $q.notify({ type: 'positive', message: 'Registro actualizado correctamente' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al actualizar registro' })
  } finally {
    loadingGuardar.value = false
  }
}

async function eliminar (id) {
  if (loadingEliminar.value) return
  loadingEliminar.value = true
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Deseas desactivar este registro?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`Personal/${id}`)
      registros.value = registros.value.filter(r => r.id !== id)
      $q.notify({ type: 'positive', message: 'Personal desactivado correctamente' })
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error al eliminar registro' })
    } finally {
      loadingEliminar.value = false
    }
  }).onCancel(() => {
    loadingEliminar.value = false
  })
}
</script>
