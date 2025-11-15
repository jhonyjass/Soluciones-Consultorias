import { api } from "src/boot/axios";

export const personalService = {
  listar() {
    return api.get("Personal");   // ✔ ESTE ES EL CORRECTO
  },

  crear(persona) {
    return api.post("Personal/registrar", persona);
  },

  actualizar(id, persona) {
    return api.put(`Personal/${id}`, persona);
  },

  eliminar(id) {
    return api.delete(`Personal/${id}`);
  }
};
