<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">Mis Registros</div>

    <q-table
      :rows="registros"
      :columns="columns"
      row-key="id"
      flat
      bordered
    >
      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn dense flat icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn dense flat icon="delete" color="negative" @click="eliminar(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- MODAL EDICIÓN -->
    <q-dialog v-model="modalEditar">
      <q-card style="min-width: 520px; max-width: 95vw;">
        <q-card-section class="text-h6">Editar registro</q-card-section>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <q-input v-model="editForm.nombre" label="Nombre" outlined />
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model.number="editForm.edadAnios" label="Edad (años)" type="number" outlined />
            </div>
            <div class="col-6">
              <q-input v-model.number="editForm.edadMeses" label="Edad (meses)" type="number" outlined />
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input v-model.number="editForm.peso" label="Peso (kg)" type="number" outlined @input="recalcularIMC" />
            </div>
            <div class="col-6">
              <q-input v-model.number="editForm.talla" label="Talla (cm)" type="number" outlined @input="recalcularIMC" />
            </div>
          </div>
          <q-input v-model="editForm.estadoNutricional" label="Estado Nutricional" outlined readonly />
          <q-input v-model="editForm.departamento" label="Departamento" outlined />
          <q-input v-model="editForm.municipio" label="Municipio" outlined />
          <q-input v-model="editForm.comunidad" label="Comunidad" outlined />
<q-input v-model="editForm.nombreResponsable" label="Nombre del responsable" outlined />
<q-input v-model="editForm.parentesco" label="Parentesco" outlined />
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
import { useUserStore } from 'src/stores/userStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const registros = ref([])
const userStore = useUserStore()
const loadingGuardar = ref(false)
const loadingEliminar = ref(false)

// ============================================================
// 🧩 Columnas de la tabla
// ============================================================
const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'edadAnios', label: 'Edad (años)', field: 'edadAnios', align: 'center' },
  { name: 'peso', label: 'Peso (kg)', field: 'peso', align: 'center' },
  { name: 'talla', label: 'Talla (cm)', field: 'talla', align: 'center' },
  { name: 'estadoNutricional', label: 'Estado Nutricional', field: 'estadoNutricional', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// ============================================================
// 🧩 Cargar registros al montar
// ============================================================
onMounted(async () => {
  try {
    if (!userStore.idUsuario) {
      $q.notify({ type: 'negative', message: 'ID de usuario no válido' })
      return
    }

    // ✅ Ajuste: usa el endpoint plural o singular según tu back
    const res = await api.get(`Ninos/listar/${userStore.idUsuario}`)
    registros.value = res.data
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar registros' })
  }
})

// ============================================================
// 🧩 Datos del modal de edición
// ============================================================
const modalEditar = ref(false)
const editForm = ref({
  id: null,
  nombre: '',
  edadAnios: null,
  edadMeses: null,
  peso: null,
  talla: null,
  estadoNutricional: '',
  departamento: '',
  municipio: '',
  comunidad: '',
  nombreResponsable: '', // ✅ agregado
  parentesco: ''         // ✅ agregado
})

// ============================================================
// 🧩 Abrir modal con datos del registro
// ============================================================
function editar (row) {
  editForm.value = { ...row }
  modalEditar.value = true
}

// ============================================================
// 🧩 Recalcular estado nutricional (IMC)
// ============================================================
function recalcularIMC () {
  const p = editForm.value.peso
  const tM = (editForm.value.talla || 0) / 100
  if (!p || !tM) return
  const imc = p / (tM * tM)
  editForm.value.estadoNutricional =
    imc < 14 ? 'Desnutrición'
      : imc < 18.5 ? 'Riesgo'
      : imc < 25 ? 'Normal'
      : imc < 30 ? 'Sobrepeso'
      : 'Obesidad'
}

// ============================================================
// 🧩 Guardar cambios (PUT api/Nino/editar/{id})
// ============================================================
async function guardarEdicion () {
  if (loadingGuardar.value) return
  loadingGuardar.value = true
  try {
    recalcularIMC() // asegurar consistencia antes de guardar

    await api.put(`Ninos/editar/${editForm.value.id}`, {
      id: editForm.value.id,
      nombre: editForm.value.nombre,
      edadAnios: editForm.value.edadAnios,
      edadMeses: editForm.value.edadMeses,
      peso: editForm.value.peso,
      talla: editForm.value.talla,
      departamento: editForm.value.departamento,
      municipio: editForm.value.municipio,
      comunidad: editForm.value.comunidad,
      nombreResponsable: editForm.value.nombreResponsable,
      parentesco: editForm.value.parentesco
    })

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

// ============================================================
// 🧩 Eliminar registro (DELETE api/Nino/{id})
// ============================================================
async function eliminar (id) {
  if (loadingEliminar.value) return
  loadingEliminar.value = true
  try {
    await api.delete(`Ninos/${id}`)
    registros.value = registros.value.filter(r => r.id !== id)
    $q.notify({ type: 'positive', message: 'Registro eliminado correctamente' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al eliminar registro' })
  } finally {
    loadingEliminar.value = false
  }
}
</script>
