<template>
  <div class="dashboard-container"><h1>Panel de Control de Conexiones</h1><div class="kpi-grid"><div class="kpi-card"><h2>Conexiones Activas</h2><p>{{ kpis.activeConnections }}</p></div><div class="kpi-card"><h2>Usuarios Únicos</h2><p>{{ kpis.uniqueUsers }}</p></div><div class="kpi-card"><h2>Conexiones Fallidas</h2><p>{{ kpis.failedConnections }}</p></div></div><div class="activity-table"><h2>Actividad Reciente</h2><table><thead><tr><th>Usuario</th><th>IP de Origen</th><th>Estado</th></tr></thead><tbody><tr v-for="activity in recentActivity" :key="activity.id"><td>{{ activity.user }}</td><td>{{ activity.ip }}</td><td>{{ activity.status }}</td></tr></tbody></table></div></div>
</template>

<script>
// 1. IMPORTAMOS NUESTRO NUEVO SERVICIO DE API
import apiService from '../apiService';

export default {
  name: 'Dashboard',
  data() {
    return {
      kpis: {},
      recentActivity: []
    };
  },
  mounted() {
    console.log("El componente Dashboard se ha montado. Pidiendo datos al apiService...");
    this.fetchDashboardData();
  },
  methods: {
    // 2. AHORA EL MÉTODO USA EL SERVICIO
    async fetchDashboardData() {
      try {
        // Hacemos la llamada a través del servicio
        const response = await apiService.getData('GET_DASHBOARD');

        // Actualizamos el 'data' del componente con los datos recibidos del servicio
        this.kpis = response.data.kpis;
        this.recentActivity = response.data.recentActivity;
      } catch (error) {
        console.error("Hubo un error al obtener los datos del dashboard:", error);
        // Aquí podríamos mostrar un mensaje de error al usuario
      }
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