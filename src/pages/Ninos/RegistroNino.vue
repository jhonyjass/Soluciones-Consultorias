<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Registro de Niño
    </div>

    <q-form @submit.prevent="guardarNino" class="q-gutter-md">

      <!-- 🌎 DATOS DE UBICACIÓN -->
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="place" class="q-mr-sm" color="primary" /> Datos de Ubicación
        </q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-select v-model="nino.departamento" :options="departamentos" label="Departamento" outlined required />
          </div>
          <div class="col-6">
            <q-select v-model="nino.municipio" :options="municipios" label="Municipio" outlined required />
          </div>
        </div>
        <q-input v-model="nino.comunidad" label="Comunidad" outlined />
      </q-card>

      <!-- 👨‍👩‍👧 DATOS DEL ENCARGADO -->
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="person" class="q-mr-sm" color="primary" /> Datos del Encargado
        </q-card-section>
        <q-input v-model="nino.nombreResponsable" label="Nombre del responsable" outlined />
        <q-input v-model="nino.parentesco" label="Parentesco" outlined />
      </q-card>

      <!-- 🧒 DATOS DEL NIÑO -->
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="child_care" class="q-mr-sm" color="primary" /> Datos del Niño
        </q-card-section>

        <q-input v-model="nino.nombre" label="Nombre del niño" outlined required />
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model.number="nino.edadAnios" label="Edad (años)" type="number" outlined required />
          </div>
          <div class="col-6">
            <q-input v-model.number="nino.edadMeses" label="Edad (meses)" type="number" outlined />
          </div>
        </div>
      </q-card>

      <!-- ⚖️ PESO, TALLA Y ESTADO NUTRICIONAL -->
      <q-card flat bordered class="q-pa-md bg-blue-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="fitness_center" class="q-mr-sm" color="primary" />
          Evaluación Nutricional
        </q-card-section>

        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-6">
            <q-input v-model.number="nino.peso" label="Peso (kg)" type="number" outlined required
              @input="calcularEstadoNutricional" @blur="calcularEstadoNutricional">
              <template #prepend><q-icon name="monitor_weight" color="primary" /></template>
            </q-input>
          </div>
          <div class="col-6">
            <q-input v-model.number="nino.talla" label="Talla (cm)" type="number" outlined required
              @input="calcularEstadoNutricional" @blur="calcularEstadoNutricional">
              <template #prepend><q-icon name="straighten" color="primary" /></template>
            </q-input>
          </div>
        </div>

        <!-- Resultado llamativo -->
        <transition name="fade">
          <div v-if="imc > 0" class="resultado-nutricional q-mt-md text-center" :class="colorEstado">
            <q-icon :name="iconoEstado" size="48px" class="q-mb-sm" />
            <div class="text-h6">
              Estado Nutricional: <strong>{{ nino.estadoNutricional }}</strong>
            </div>
            <div class="text-subtitle2 text-grey-9">
              IMC: {{ imc.toFixed(2) }}
            </div>
          </div>
        </transition>
      </q-card>

      <!-- BOTÓN GUARDAR -->
      <div class="q-mt-md flex justify-end">
        <q-btn type="submit" color="primary" label="Guardar Registro" icon="save" :loading="loadingGuardar"
          :disable="loadingGuardar" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'
import { departamentosData } from 'src/data/departamentosMunicipios'

const $q = useQuasar()
const userStore = useUserStore()
const loadingGuardar = ref(false)

const departamentos = ref(Object.keys(departamentosData))
const municipios = ref([])

const nino = ref({
  nombre: '',
  edadAnios: null,
  edadMeses: null,
  nombreResponsable: '',
  parentesco: '',
  peso: null,
  talla: null,
  estadoNutricional: '',
  departamento: '',
  municipio: '',
  comunidad: '',
  usuarioId: userStore.idUsuario
})

const imc = ref(0)

// Cuando cambia el departamento, se actualizan los municipios
watch(() => nino.value.departamento, (nuevo) => {
  municipios.value = nuevo ? departamentosData[nuevo] : []
  nino.value.municipio = ''
})

// Cálculo automático del estado nutricional
function calcularEstadoNutricional() {
  const peso = nino.value.peso
  const tallaM = (nino.value.talla || 0) / 100
  if (!peso || !tallaM) return

  imc.value = peso / (tallaM * tallaM)

  if (imc.value < 14) nino.value.estadoNutricional = 'Desnutrición'
  else if (imc.value < 18.5) nino.value.estadoNutricional = 'Riesgo'
  else if (imc.value < 25) nino.value.estadoNutricional = 'Normal'
  else if (imc.value < 30) nino.value.estadoNutricional = 'Sobrepeso'
  else nino.value.estadoNutricional = 'Obesidad'
}

// Colores y iconos dinámicos
const colorEstado = computed(() => {
  switch (nino.value.estadoNutricional) {
    case 'Desnutrición': return 'estado-rojo'
    case 'Riesgo': return 'estado-naranja'
    case 'Normal': return 'estado-verde'
    case 'Sobrepeso': return 'estado-amarillo'
    case 'Obesidad': return 'estado-morado'
    default: return ''
  }
})

const iconoEstado = computed(() => {
  switch (nino.value.estadoNutricional) {
    case 'Desnutrición': return 'sentiment_dissatisfied'
    case 'Riesgo': return 'warning'
    case 'Normal': return 'sentiment_satisfied_alt'
    case 'Sobrepeso': return 'trending_up'
    case 'Obesidad': return 'error'
    default: return 'help_outline'
  }
})

// Guardar registro
async function guardarNino() {
  if (loadingGuardar.value) return
  loadingGuardar.value = true
  try {
    // Validaciones previas
    if (!nino.value.nombre || !nino.value.departamento || !nino.value.municipio) {
      $q.notify({ type: 'warning', message: 'Completa todos los campos obligatorios' })
      return
    }

    if (nino.value.peso <= 0 || nino.value.talla <= 0) {
      $q.notify({ type: 'warning', message: 'Peso y talla deben ser mayores a cero' })
      return
    }

    // Petición al backend
    const response = await api.post('NinoS/registrar', nino.value)
    const data = response.data

    // Éxito
    $q.notify({
      type: 'positive',
      message: data.mensaje || 'Niño registrado correctamente'
    })

    // Mostrar IMC actualizado del backend si lo envía
    if (data.imc) imc.value = data.imc
    if (data.estadoNutricional) nino.value.estadoNutricional = data.estadoNutricional

    // Resetear formulario
    Object.assign(nino.value, {
      nombre: '',
      edadAnios: null,
      edadMeses: null,
      nombreResponsable: '',
      parentesco: '',
      peso: null,
      talla: null,
      estadoNutricional: '',
      departamento: '',
      municipio: '',
      comunidad: '',
      usuarioId: userStore.idUsuario
    })
    imc.value = 0
  } catch (error) {
    console.error('Error al registrar niño:', error)
    const mensaje =
      error.response?.data?.mensaje || 'Error al registrar el niño. Verifica los datos.'
    $q.notify({ type: 'negative', message: mensaje })
  }finally {
    loadingGuardar.value = false
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 10px;
}

/* Animación para el resultado */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Tarjeta llamativa para el estado nutricional */
.resultado-nutricional {
  border-radius: 12px;
  padding: 16px;
  font-weight: bold;
  transition: 0.4s all;
}

.estado-rojo {
  background: #ffebee;
  color: #b71c1c;
  border: 2px solid #ef5350;
}

.estado-naranja {
  background: #fff3e0;
  color: #e65100;
  border: 2px solid #ff9800;
}

.estado-verde {
  background: #e8f5e9;
  color: #2e7d32;
  border: 2px solid #66bb6a;
}

.estado-amarillo {
  background: #fffde7;
  color: #f9a825;
  border: 2px solid #fbc02d;
}

.estado-morado {
  background: #f3e5f5;
  color: #6a1b9a;
  border: 2px solid #ab47bc;
}
</style>
