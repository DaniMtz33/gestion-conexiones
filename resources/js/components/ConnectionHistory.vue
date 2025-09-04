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
    fetchHistory() {
      // --- SIMULACIÓN DE API ---
      const mockHistory = [
        { id: 1, user: 'user_app_01', ip: '192.168.1.10', timestamp: '2025-09-04 14:30:15', status: 'Exitoso' },
        { id: 2, user: 'root', ip: '201.150.3.45', timestamp: '2025-09-04 14:25:10', status: 'Fallido' },
        { id: 3, user: 'user_db_03', ip: '10.0.0.5', timestamp: '2025-09-04 14:22:05', status: 'Exitoso' },
        { id: 4, user: 'user_batch', ip: '192.168.1.15', timestamp: '2025-09-04 14:15:45', status: 'Exitoso' },
        { id: 5, user: 'api_connect', ip: '192.168.1.20', timestamp: '2025-09-04 14:10:00', status: 'Exitoso' },
      ];
      // --- FIN DE LA SIMULACIÓN ---
      this.connections = mockHistory;
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