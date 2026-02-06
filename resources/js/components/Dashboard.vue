<template>
  <div class="dashboard-container">
    <h1 class="mb-4 text-secondary">Dashboard General</h1>

    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card kpi-card border-primary mb-3">
          <div class="card-body text-primary">
            <h5 class="card-title text-uppercase font-weight-bold">Conexiones Activas</h5>
            <p class="card-text display-4">{{ kpis.activeConnections }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card kpi-card border-success mb-3">
          <div class="card-body text-success">
            <h5 class="card-title text-uppercase font-weight-bold">Total Usuarios</h5>
            <p class="card-text display-4">{{ kpis.totalUsers }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card kpi-card border-warning mb-3">
          <div class="card-body text-warning">
            <h5 class="card-title text-uppercase font-weight-bold">Media Diaria (Mes)</h5>
            <p class="card-text display-4">{{ kpis.alerts }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-white font-weight-bold">
            <i class="bi bi-graph-up"></i> Tendencia de Conexiones (30 días)
          </div>
          <div class="card-body">
            <div class="chart-container">
                <canvas id="trendsChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <br>

      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-white font-weight-bold">
            <i class="bi bi-hdd-network"></i> Top 5 IPs de Origen
          </div>
          <div class="card-body">
            <div class="chart-container">
                <canvas id="ipsChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../apiService';
import Chart from 'chart.js/auto'; 

export default {
  name: 'Dashboard',
  data() {
    return {
      kpis: { activeConnections: 0, totalUsers: 0, alerts: 0 },
      trendsChartInstance: null,
      ipsChartInstance: null
    };
  },
  async mounted() {
    await this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
      try {
        const response = await apiService.getData('GET_DASHBOARD');
        const data = response.data;
        
        this.kpis = data.kpis;
        // Esperamos un momento para asegurar que el DOM (los canvas) estén listos
        this.$nextTick(() => {
            this.renderCharts(data.charts);
        });
        
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    },
    renderCharts(charts) {
      // 1. Gráfica de Tendencias
      const ctx1 = document.getElementById('trendsChart');
      if (ctx1) {
          if (this.trendsChartInstance) this.trendsChartInstance.destroy();
          
          this.trendsChartInstance = new Chart(ctx1, {
            type: 'line',
            data: {
              labels: charts.trends.labels,
              datasets: [{
                label: 'Conexiones Diarias',
                data: charts.trends.data,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.3,
                fill: true
              }]
            },
            options: { responsive: true, maintainAspectRatio: false }
          });
      }

      // 2. Gráfica de Top IPs
      const ctx2 = document.getElementById('ipsChart');
      if (ctx2) {
          if (this.ipsChartInstance) this.ipsChartInstance.destroy();

          this.ipsChartInstance = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: charts.topIps.labels,
              datasets: [{
                label: 'Intentos de Conexión',
                data: charts.topIps.data,
                backgroundColor: [
                  '#198754', '#20c997', '#0dcaf0', '#ffc107', '#fd7e14'
                ],
                borderWidth: 1
              }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y' // Esto hace las barras horizontales
            }
          });
      }
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}
.kpi-card {
    border-width: 0 0 0 4px; /* Borde de color solo a la izquierda */
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.chart-container {
    position: relative;
    height: 300px;
    width: 100%;
}
</style>