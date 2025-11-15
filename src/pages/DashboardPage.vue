<template>
  <q-page padding>

    <!-- TÍTULO -->
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Panel General del Sistema
    </div>

    <!-- ===================================================== -->
    <!--  BLOQUE 1 : ESTADO NUTRICIONAL + KPIs                 -->
    <!-- ===================================================== -->
    <q-card class="q-pa-md q-mb-xl" style="border-radius: 14px;">
      <div class="row">

        <!-- DONUT -->
        <div class="col-12 col-md-6 flex flex-center">
          <canvas ref="nutricionChart"></canvas>
        </div>

        <!-- KPIs -->
        <div class="col-12 col-md-6">
          <div class="column q-gutter-md">

            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-subtitle1 text-bold">Total de Niños</div>
                <div class="text-h5 text-primary">{{ totalNinos }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-subtitle1 text-bold">Total de Personal</div>
                <div class="text-h5 text-green">{{ totalPersonal }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-subtitle1 text-bold">Contratos Activos</div>
                <div class="text-h5 text-indigo">{{ contratosActivos }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-subtitle1 text-bold">Contratos Finalizados</div>
                <div class="text-h5 text-red">{{ contratosInactivos }}</div>
              </q-card-section>
            </q-card>

          </div>
        </div>

      </div>
    </q-card>


    <!-- ===================================================== -->
    <!--  BLOQUE 2 : GRAFICAS SECUNDARIAS                      -->
    <!-- ===================================================== -->
    <div class="row q-col-gutter-md q-mb-xl">

      <div class="col-12 col-md-6">
        <q-card class="q-pa-md" style="border-radius: 14px;">
          <div class="text-subtitle1 text-bold q-mb-sm">Niños por Departamento</div>
          <canvas ref="ninosDeptoChart"></canvas>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="q-pa-md" style="border-radius: 14px;">
          <div class="text-subtitle1 text-bold q-mb-sm">Personal por Departamento</div>
          <canvas ref="personalDeptoChart"></canvas>
        </q-card>
      </div>

    </div>


    <!-- ===================================================== -->
    <!--  BLOQUE 3 : CONTRATOS + USUARIOS                     -->
    <!-- ===================================================== -->
    <div class="row q-col-gutter-md q-mb-xl">

      <div class="col-12 col-md-6">
        <q-card class="q-pa-md" style="border-radius: 14px;">
          <div class="text-subtitle1 text-bold q-mb-sm">
            Contratos Activos / Finalizados
          </div>
          <canvas ref="contratosChart"></canvas>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="q-pa-md" style="border-radius: 14px; min-height: 260px;">
          <div class="text-subtitle1 text-bold q-mb-sm">Últimos 5 Usuarios</div>

          <q-list bordered separator>
            <q-item v-for="u in ultimosUsuarios" :key="u.email">
              <q-item-section>
                <q-item-label>{{ u.nombre }}</q-item-label>
                <q-item-label caption>{{ u.email }} — {{ u.fecha }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

    </div>


    <!-- ===================================================== -->
    <!--  BLOQUE 4 : MAPA DE GUATEMALA                        -->
    <!-- ===================================================== -->
    <q-card class="q-pa-md q-mt-xl" style="border-radius: 14px;">

      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Mapa de Guatemala</div>

        <q-btn-toggle
          v-model="modoMapa"
          toggle-color="primary"
          color="white"
          :options="[
            { label: 'Niños', value: 'ninos' },
            { label: 'Personal', value: 'personal' },
            { label: 'Contratos', value: 'contratos' }
          ]"
        />
      </div>

      <div ref="mapaGuatemala"
           style="height: 510px; width: 100%; border-radius: 12px;"></div>

    </q-card>

  </q-page>
</template>



<script setup>
import { ref, onMounted, watch } from "vue";
import { Chart } from "chart.js/auto";
import * as echarts from "echarts";

// MAPA REAL
import guatemalaMap from "src/assets/maps/guatemala.json";

import { dashboardService } from "src/services/dashboard.service";

// ==== REFS ====
const nutricionChart = ref(null);
const ninosDeptoChart = ref(null);
const personalDeptoChart = ref(null);
const contratosChart = ref(null);
const mapaGuatemala = ref(null);

// ==== VARIABLES ====
const totalNinos = ref(0);
const totalPersonal = ref(0);
const contratosActivos = ref(0);
const contratosInactivos = ref(0);
const ultimosUsuarios = ref([]);

const modoMapa = ref("ninos");
let chartMapa = null;

// ============================================================
//  CARGA DE GRÁFICAS CHART JS
// ============================================================
async function cargarEstadoNutricional() {
  const { data } = await dashboardService.estadoNutricional();

  new Chart(nutricionChart.value, {
    type: "doughnut",
    data: {
      labels: data.map(d => d.estado),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: ["#1E88E5", "#43A047", "#FB8C00", "#E53935", "#8E24AA"]
      }]
    }
  });
}

async function cargarNinosDepto() {
  const { data } = await dashboardService.ninosPorDepartamento();

  new Chart(ninosDeptoChart.value, {
    type: "bar",
    data: {
      labels: data.map(d => d.departamento),
      datasets: [{
        label: "Niños",
        data: data.map(d => d.total),
        backgroundColor: "#1E88E5"
      }]
    }
  });
}

async function cargarPersonalDepto() {
  const { data } = await dashboardService.personalPorDepartamento();

  new Chart(personalDeptoChart.value, {
    type: "bar",
    data: {
      labels: data.map(d => d.departamento),
      datasets: [{
        label: "Personal",
        data: data.map(d => d.total),
        backgroundColor: "#43A047"
      }]
    }
  });
}

async function cargarContratos() {
  const { data } = await dashboardService.contratos();

  contratosActivos.value = data.activos;
  contratosInactivos.value = data.inactivos;

  new Chart(contratosChart.value, {
    type: "doughnut",
    data: {
      labels: ["Activos", "Finalizados"],
      datasets: [{
        data: [data.activos, data.inactivos],
        backgroundColor: ["#3949AB", "#E53935"]
      }]
    }
  });
}

async function cargarKPIs() {
  totalNinos.value = (await dashboardService.totalNinos()).data.total;
  totalPersonal.value = (await dashboardService.totalPersonal()).data.total;
}

async function cargarUltimosUsuarios() {
  ultimosUsuarios.value = (await dashboardService.ultimosUsuarios()).data;
}

// ============================================================
//                   🗺 MAPA DE GUATEMALA REAL
// ============================================================
async function cargarMapa() {
  const { data } = await dashboardService.mapa();

  echarts.registerMap("guatemala", guatemalaMap);

  chartMapa = echarts.init(mapaGuatemala.value);

  function actualizarMapa() {
    let dataset = [];

    if (modoMapa.value === "ninos") dataset = data.ninos;
    if (modoMapa.value === "personal") dataset = data.personal;
    if (modoMapa.value === "contratos") dataset = data.contratos;

    chartMapa.setOption({

      tooltip: {
        trigger: "item",
        formatter: p => `${p.name}<br><b>${p.value || 0} registros</b>`
      },

      visualMap: {
        min: 0,
        max: Math.max(...dataset.map(d => d.total)) || 5,
        left: 30,
        bottom: 30,
        inRange: { color: ["#E3F2FD", "#1E88E5"] }
      },

      series: [{
        type: "map",
        map: "guatemala",
        roam: true,
        data: dataset.map(x => ({
          name: x.departamento,
          value: x.total
        }))
      }]

    });

    setTimeout(() => chartMapa.resize(), 200);
  }

  watch(modoMapa, actualizarMapa);
  actualizarMapa();
}

onMounted(async () => {
  await cargarEstadoNutricional();
  await cargarKPIs();
  await cargarNinosDepto();
  await cargarPersonalDepto();
  await cargarContratos();
  await cargarUltimosUsuarios();
  await cargarMapa();
});
</script>
