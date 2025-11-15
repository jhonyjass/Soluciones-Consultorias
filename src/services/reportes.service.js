import { api } from 'src/boot/axios'

export default {
  listar() {
    return api.get('Reportes');
  },

  generar(data) {
    return api.post('Reportes/generar', data, {
      responseType: 'blob' // necesario para descargar PDF
    });
  }
}
