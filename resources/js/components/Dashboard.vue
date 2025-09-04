<template>
  <div class="dashboard-container">
    <h1>Panel de Control de Conexiones</h1>

    <div class="kpi-grid">
      <div class="kpi-card">
        <h2>Conexiones Activas</h2>
        <p>{{ kpis.activeConnections }}</p>
      </div>
      <div class="kpi-card">
        <h2>Usuarios Únicos</h2>
        <p>{{ kpis.uniqueUsers }}</p>
      </div>
      <div class="kpi-card">
        <h2>Conexiones Fallidas</h2>
        <p>{{ kpis.failedConnections }}</p>
      </div>
    </div>

    <div class="activity-table">
      <h2>Actividad Reciente</h2>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>IP de Origen</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in recentActivity" :key="activity.id">
            <td>{{ activity.user }}</td>
            <td>{{ activity.ip }}</td>
            <td>{{ activity.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  // 1. 'data' es donde vive el estado (la información) de nuestro componente.
  data() {
    return {
      kpis: {
        activeConnections: 0,
        uniqueUsers: 0,
        failedConnections: 0
      },
      recentActivity: []
    };
  },
  // 2. 'mounted' es un método que se ejecuta automáticamente cuando el componente
  //    se ha cargado en la página. Es el lugar perfecto para pedir datos.
  mounted() {
    console.log("El componente Dashboard se ha montado. Cargando datos simulados...");
    this.fetchDashboardData();
  },
  methods: {
    // 3. Creamos un método para simular la llamada a la API.
    fetchDashboardData() {
      // --- SIMULACIÓN DE API ---
      // En un futuro, aquí iría la llamada real a la API con 'axios' o 'fetch'.
      // Por ahora, creamos los datos directamente.
      const mockApiData = {
        kpis: {
          activeConnections: 12,
          uniqueUsers: 5,
          failedConnections: 2
        },
        recentActivity: [
          { id: 1, user: 'user_app_01', ip: '192.168.1.10', status: 'Conectado' },
          { id: 2, user: 'user_db_03', ip: '10.0.0.5', status: 'Conectado' },
          { id: 3, user: 'user_batch', ip: '192.168.1.15', status: 'Desconectado' },
          { id: 4, user: 'admin_user', ip: '192.168.1.20', status: 'Conectado' },
        ]
      };
      // --- FIN DE LA SIMULACIÓN ---

      // Actualizamos el 'data' del componente con los datos recibidos.
      this.kpis = mockApiData.kpis;
      this.recentActivity = mockApiData.recentActivity;
    }
  }
};
</script>

<style scoped>
/* Estos estilos se aplican solo a este componente */
.dashboard-container {
  font-family: sans-serif;
  max-width: 900px;
  margin: 40px auto;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}
.kpi-card {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.kpi-card h2 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #555;
}
.kpi-card p {
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
}
.activity-table {
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
  padding: 12px;
  border-bottom: 1px solid #eee;
}
th {
  color: #333;
}
</style>