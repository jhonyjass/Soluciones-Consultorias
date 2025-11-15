<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Reportes Generados
    </div>

    <q-table
      flat bordered
      :rows="reportes"
      :columns="columns"
      row-key="id"
      separator="horizontal"
    >
      <template #body-cell-acciones="props">
        <q-td>
          <q-btn
            color="primary"
            icon="download"
            dense
            flat
            round
            @click="descargar(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import reportesService from 'src/services/reportes.service'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const reportes = ref([])

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'tipo_reporte', label: 'Tipo', field: 'tipoReporte', align: 'left' },
  { name: 'usuario', label: 'Generado por', field: 'usuario', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fechaGeneracion', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

async function cargarReportes() {
  try {
    const { data } = await reportesService.listar()
    reportes.value = data
  } catch (e) {
    console.error(e)
  }
}

async function descargar(row) {
  try {
    const { data } = await reportesService.generar({
      tipoReporte: row.tipoReporte,
      usuarioId: 1,
      formato: row.formato
    });

    const ext = row.formato === "EXCEL" ? "xlsx" : "pdf";

    const mime =
      row.formato === "EXCEL"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";

    const blob = new Blob([data], { type: mime });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${row.tipoReporte}.${ext}`;
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error al descargar reporte:', error)
    $q.notify({ type: 'negative', message: 'Error al descargar el reporte.' })
  }
}

onMounted(cargarReportes)
</script>
