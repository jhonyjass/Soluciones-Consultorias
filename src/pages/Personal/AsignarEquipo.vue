<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Asignar Equipo Antropométrico
    </div>

    <!-- FORMULARIO PRINCIPAL -->
    <q-form @submit.prevent="guardarAsignacion" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="construction" class="q-mr-sm" color="primary" />
          Datos de Asignación
        </q-card-section>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-select
              v-model="form.personalId"
              :options="personalOptions"
              label="Seleccione Personal"
              outlined
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              @update:model-value="cargarEquipos"
              :rules="[val => !!val || 'Seleccione un personal']"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.equipo"
              label="Nombre del Equipo"
              outlined
              required
              :rules="[val => val && val.length > 0 || 'Ingrese el nombre del equipo']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model.number="form.cantidad"
              label="Cantidad"
              type="number"
              outlined
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
            />
          </div>
          <div class="col-6">
            <q-input v-model="form.observaciones" label="Observaciones" outlined />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="form.fechaAsignacion"
              type="date"
              label="Fecha de Asignación"
              outlined
              :rules="[val => !!val || 'Seleccione una fecha']"
            />
          </div>
        </div>
      </q-card>

      <div class="q-mt-md flex justify-end">
        <q-btn
          type="submit"
          color="primary"
          label="Guardar Asignación"
          icon="save"
          :loading="loadingGuardar"
          :disable="loadingGuardar"
        />
      </div>
    </q-form>

    <q-separator class="q-my-lg" />

    <!-- TABLA DE EQUIPOS ASIGNADOS -->
    <div v-if="equipos.length">
      <div class="text-h6 text-primary q-mb-sm">Equipos Asignados</div>

      <q-table
        :rows="equipos"
        :columns="columns"
        row-key="id"
        flat
        bordered
        no-data-label="Sin equipos asignados"
      >
        <template #body-cell-acciones="props">
          <q-td :props="props" class="text-center">
            <q-btn
              dense
              flat
              round
              color="primary"
              icon="edit"
              @click="abrirEdicion(props.row)"
              :disable="loadingEditar || loadingEliminar"
            />
            <q-btn
              dense
              flat
              round
              color="negative"
              icon="delete"
              @click="eliminarEquipo(props.row.id)"
              :disable="loadingEditar || loadingEliminar"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- MODAL DE EDICIÓN -->
    <q-dialog v-model="modalEditar" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 400px">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="edit" class="q-mr-sm" color="primary" />
          Editar Equipo
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-model="editForm.equipo" label="Nombre del Equipo" outlined />
          <q-input
            v-model.number="editForm.cantidad"
            label="Cantidad"
            type="number"
            outlined
            class="q-mt-sm"
          />
          <q-input
            v-model="editForm.observaciones"
            label="Observaciones"
            outlined
            class="q-mt-sm"
          />
          <q-input
            v-model="editForm.fechaAsignacion"
            type="date"
            label="Fecha de Asignación"
            outlined
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            color="primary"
            label="Guardar Cambios"
            @click="guardarEdicion"
            :loading="loadingEditar"
            :disable="loadingEditar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const userStore = useUserStore()

// ===== Variables principales =====
const personalOptions = ref([])
const equipos = ref([])
const modalEditar = ref(false)

const loadingGuardar = ref(false)
const loadingEditar = ref(false)
const loadingEliminar = ref(false)

const form = ref({
  personalId: null,
  equipo: '',
  cantidad: 1,
  observaciones: '',
  fechaAsignacion: new Date().toISOString().split('T')[0], // formato YYYY-MM-DD
  usuarioId: userStore.idUsuario
})

const editForm = ref({
  id: null,
  equipo: '',
  cantidad: 1,
  observaciones: '',
  fechaAsignacion: ''
})

const columns = [
  { name: 'equipo', label: 'Equipo', field: 'equipo', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'center' },
  { name: 'fechaAsignacion', label: 'Fecha Asignación', field: 'fechaAsignacion', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// ===== Cargar lista de personal =====
onMounted(async () => {
  try {
    const res = await api.get('Personal/historial')
    personalOptions.value = res.data
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar personal' })
  }
})

// ===== Cargar equipos asignados por personal =====
async function cargarEquipos (id) {
  try {
    if (!id) return
    const res = await api.get(`Personal/equipos/${id}`)
    equipos.value = res.data
  } catch (err) {
    console.error(err)
    equipos.value = []
  }
}

// ===== Guardar nueva asignación =====
async function guardarAsignacion () {
  if (loadingGuardar.value) return
  loadingGuardar.value = true

  try {
    if (!form.value.personalId) {
      $q.notify({ type: 'warning', message: 'Seleccione un personal primero' })
      return
    }

    const payload = {
      personalId: form.value.personalId,
      equipo: form.value.equipo.trim(),
      cantidad: form.value.cantidad,
      observaciones: form.value.observaciones?.trim() || '',
      fechaAsignacion: form.value.fechaAsignacion, // formato YYYY-MM-DD
      usuarioId: userStore.idUsuario
    }

    const res = await api.post('Personal/asignar-equipo', payload)
    $q.notify({ type: 'positive', message: res.data.mensaje })
    await cargarEquipos(form.value.personalId)

    Object.assign(form.value, {
      equipo: '',
      cantidad: 1,
      observaciones: '',
      fechaAsignacion: new Date().toISOString().split('T')[0]
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al asignar equipo' })
  } finally {
    loadingGuardar.value = false
  }
}

// ===== Abrir modal de edición =====
function abrirEdicion (row) {
  editForm.value = { ...row }
  modalEditar.value = true
}

// ===== Guardar cambios del modal =====
async function guardarEdicion () {
  if (loadingEditar.value) return
  loadingEditar.value = true

  try {
    const payload = {
      equipo: editForm.value.equipo.trim(),
      cantidad: editForm.value.cantidad,
      observaciones: editForm.value.observaciones?.trim() || '',
      fechaAsignacion: editForm.value.fechaAsignacion,
      personalId: form.value.personalId,
      usuarioId: userStore.idUsuario
    }

    const res = await api.put(`Personal/equipos/${editForm.value.id}`, payload)
    $q.notify({ type: 'positive', message: res.data.mensaje })
    modalEditar.value = false
    await cargarEquipos(form.value.personalId)
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al actualizar equipo' })
  } finally {
    loadingEditar.value = false
  }
}

// ===== Eliminar equipo asignado =====
async function eliminarEquipo (id) {
  if (loadingEliminar.value) return
  loadingEliminar.value = true

  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Desea eliminar este equipo asignado?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`Personal/equipos/${id}`)
      equipos.value = equipos.value.filter(e => e.id !== id)
      $q.notify({ type: 'positive', message: 'Equipo eliminado correctamente' })
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error al eliminar equipo' })
    } finally {
      loadingEliminar.value = false
    }
  }).onCancel(() => {
    loadingEliminar.value = false
  })
}
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
