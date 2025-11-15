import { api } from "src/boot/axios";

export const dashboardService = {
  estadoNutricional() {
    return api.get("/Dashboard/estado-nutricional");
  },
  totalNinos() {
    return api.get("/Dashboard/total-ninos");
  },
  ninosPorDepartamento() {
    return api.get("/Dashboard/ninos-por-departamento");
  },
  totalPersonal() {
    return api.get("/Dashboard/total-personal");
  },
  personalPorDepartamento() {
    return api.get("/Dashboard/personal-por-departamento");
  },
  contratos() {
    return api.get("/Dashboard/contratos");
  },
  asistenciasMes() {
    return api.get("/Dashboard/asistencias-mes");
  },
  ultimosUsuarios() {
    return api.get("/Dashboard/ultimos-usuarios");
  },
  mapa() {
  return api.get("/Dashboard/mapa");
}

};
