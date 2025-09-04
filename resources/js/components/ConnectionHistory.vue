<template>
  <div class="history-container">
    <h1>Historial de Conexiones</h1>
    <p>Registro histórico de todos los intentos de conexión al servidor.</p>

    <div class="history-table">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>IP de Origen</th>
            <th>Fecha y Hora</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="conn in connections" :key="conn.id">
            <td>{{ conn.user }}</td>
            <td>{{ conn.ip }}</td>
            <td>{{ conn.timestamp }}</td>
            <td>
              <span :class="['status', conn.status === 'Exitoso' ? 'status-success' : 'status-failed']">
                {{ conn.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// 1. IMPORTAMOS EL SERVICIO
import apiService from '../apiService';

export default {
  name: 'ConnectionHistory',
  data() {
    return {
      connections: []
    };
  },
  mounted() {
    this.fetchHistory();
  },
  methods: {
    // 2. MODIFICAMOS EL MÉTODO PARA USAR EL SERVICIO
    async fetchHistory() {
      try {
        const response = await apiService.getData('GET_HISTORY');
        this.connections = response.data;
      } catch (error) {
        console.error("Hubo un error al obtener el historial:", error);
      }
    }
  }
};
</script>

<style scoped>
/* Puedes añadir estilos similares a UserList.vue o personalizarlos */
.history-container {
  font-family: sans-serif;
}
.history-table {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}
.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.status-success {
  background-color: #e2f5ea;
  color: #34a853;
}
.status-failed {
  background-color: #f8e1e1;
  color: #ea4335;
}
</style>