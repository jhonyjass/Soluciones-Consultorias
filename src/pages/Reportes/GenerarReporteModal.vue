<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Generar Reporte
    </div>

    <q-card flat bordered class="q-pa-lg bg-grey-1">

      <div class="row q-col-gutter-md">

        <!-- TIPO DE REPORTE -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="form.tipoReporte"
            :options="tipos"
            label="Tipo de reporte"
            outlined
            dense
          />
        </div>

        <!-- FORMATO -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="form.formato"
            :options="formatos"
            label="Formato"
            outlined
            dense
          />
        </div>

      </div>

      <div class="q-mt-xl flex justify-end">
        <q-btn
          color="primary"
          label="Generar Reporte"
          icon="picture_as_pdf"
          @click="generar"
        />
      </div>

    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import reportesService from "src/services/reportes.service";
import { useUserStore } from "src/stores/userStore";

const $q = useQuasar();
const userStore = useUserStore();

const tipos = ["NINO", "PERSONAL", "UBICACION", "CONTRATO", "NOMINA"];
const formatos = ["PDF", "EXCEL"]; // AMBOS ELIMINADO

const form = ref({
  tipoReporte: null,
  formato: "PDF"
});

async function generar() {
  if (!form.value.tipoReporte) {
    $q.notify({
      type: "warning",
      message: "Selecciona el tipo de reporte."
    });
    return;
  }

  try {
    const payload = {
      tipoReporte: form.value.tipoReporte,
      usuarioId: userStore.idUsuario,
      formato: form.value.formato
    };

    const response = await reportesService.generar(payload);

    // EXTENSIÓN SEGÚN FORMATO
    const ext = payload.formato === "EXCEL" ? "xlsx" : "pdf";

    // MIME TYPE SEGÚN FORMATO
    const mime =
      payload.formato === "EXCEL"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";

    const blob = new Blob([response.data], { type: mime });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_${payload.tipoReporte}.${ext}`;
    a.click();

    $q.notify({
      type: "positive",
      message: "Reporte generado correctamente."
    });

  } catch (e) {
    console.error(e);
    $q.notify({
      type: "negative",
      message: "Error al generar el reporte."
    });
  }
}
</script>
