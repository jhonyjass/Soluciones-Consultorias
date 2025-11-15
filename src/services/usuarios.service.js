import { api } from "src/boot/axios";

export default {
  listar() {
    return api.get("/Usuario");
  },

  crear(data) {
    return api.post("/Usuario", data);
  },

  actualizar(id, data) {
    return api.put(`/Usuario/${id}`, data);
  },

  eliminar(id) {
    return api.delete(`/Usuario/${id}`);
  },

  listarRoles() {
    return api.get("/Usuario/roles");
  }
};
