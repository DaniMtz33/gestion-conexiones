<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Dashboard General</h1>
      <p>Visualización en tiempo real del estado de las conexiones y métricas de uso.</p>
    </header>

    <main class="settings-content">
      <div class="stats-grid mb-4">
        <section class="card kpi-card border-blue">
          <div class="card-header-modern">
            <div class="icon-circle bg-blue">
              <i class="icon">🔌</i>
            </div>
            <h3>Conexiones Activas</h3>
          </div>
          <div class="kpi-value text-blue">{{ kpis.activeConnections }}</div>
        </section>

        <section class="card kpi-card border-green">
          <div class="card-header-modern">
            <div class="icon-circle bg-green">
              <i class="icon">👥</i>
            </div>
            <h3>Total Usuarios</h3>
          </div>
          <div class="kpi-value text-green">{{ kpis.totalUsers }}</div>
        </section>

        <section class="card kpi-card border-orange">
          <div class="card-header-modern">
            <div class="icon-circle bg-orange">
              <i class="icon">📊</i>
            </div>
            <h3>Media Diaria (Mes)</h3>
          </div>
          <div class="kpi-value text-orange">{{ kpis.alerts }}</div>
        </section>
      </div>

      <div class="row">
        <div class="col-12 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <div class="card-header-modern justify-content-start mb-4">
                <div class="icon-circle bg-blue-light">
                  <i class="bi bi-graph-up text-blue"></i>
                </div>
                <h3>Tendencia de Conexiones (30 días)</h3>
              </div>
              
              <div class="chart-container">
                <canvas id="trendsChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <div class="card-header-modern justify-content-start mb-4">
                <div class="icon-circle bg-orange-light">
                  <i class="bi bi-hdd-network text-orange"></i>
                </div>
                <h3>Top 5 IPs de Origen Mensual</h3>
              </div>

              <div class="chart-container">
                <canvas id="ipsChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import apiService from '../apiService';
import Chart from 'chart.js/auto'; 

export default {
  name: 'Dashboard',
  data() {
    return {
      kpis: { activeConnections: 0, totalUsers: '...', alerts: 0 },
      loading: true,
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
        const lastKnownTotal = localStorage.getItem('last_total_users');
        if (lastKnownTotal) {
            this.kpis.totalUsers = lastKnownTotal;
        }

        const response = await apiService.getData('GET_DASHBOARD');
        
        if (response && response.data && response.data.kpis) {
            const data = response.data;
            const newTotal = data.kpis.totalUsers;

            if (newTotal > 0) {
                this.kpis.totalUsers = newTotal;
                localStorage.setItem('last_total_users', newTotal); 
            } else if (this.kpis.totalUsers === '...') {
                this.kpis.totalUsers = 0;
            }

            this.kpis.activeConnections = data.kpis.activeConnections;
            this.kpis.alerts = data.kpis.alerts;
            
            this.$nextTick(() => {
                if (data.charts) {
                    this.renderCharts(data.charts);
                }
            });
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    },

    renderCharts(charts) {
      const canvas1 = document.getElementById('trendsChart');
      if (canvas1 && charts.trends) {
        const existingChart1 = Chart.getChart(canvas1); 
        if (existingChart1) existingChart1.destroy();
      
        this.trendsChartInstance = new Chart(canvas1, {
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
          options: { 
            responsive: true, 
            maintainAspectRatio: false,
            animation: { duration: 1000 }
          }
        });
      }

      const canvas2 = document.getElementById('ipsChart');
      if (canvas2 && charts.topIps) {
          const existingChart2 = Chart.getChart(canvas2);
          if (existingChart2) existingChart2.destroy();

          this.ipsChartInstance = new Chart(canvas2, {
            type: 'bar',
            data: {
              labels: charts.topIps.labels,
              datasets: [{
                label: 'Intentos de Conexión',
                data: charts.topIps.data,
                backgroundColor: ['#198754', '#20c997', '#0dcaf0', '#ffc107', '#fd7e14'],
                borderWidth: 1
              }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
          });
        }
    }
  }
};
</script>

<style scoped>
/* Contenedor Unificado */
.settings-page {
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
  color: #2d3748;
}

.settings-header {
  margin-bottom: 30px;
  text-align: center;
}

.settings-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
}

/* KPIs Modernos */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.kpi-card {
  padding: 24px;
  border-left: 5px solid #edf2f7;
  text-align: center;
}

.border-blue { border-left-color: #4299e1; }
.border-green { border-left-color: #48bb78; }
.border-orange { border-left-color: #ed8936; }

/* Estilo de Encabezado Moderno (Usado en KPIs y ahora en Gráficas) */
.card-header-modern {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Alineación central para KPIs, izquierda para gráficas largas */
.justify-content-start { justify-content: flex-start; }
.justify-content-center { justify-content: center; }

.card-header-modern h3 {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #718096;
  margin: 0;
  letter-spacing: 0.05em;
}

.icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Colores de Círculos */
.bg-blue { background: #ebf8ff; color: #4299e1; }
.bg-green { background: #f0fff4; color: #48bb78; }
.bg-orange { background: #fffaf0; color: #ed8936; }
.bg-blue-light { background: #e6f6ff; }
.bg-orange-light { background: #fff5eb; }

/* Colores de Iconos Bootstrap */
.text-blue { color: #3182ce; }
.text-orange { color: #dd6b20; }

.kpi-value {
  font-size: 2.6rem;
  font-weight: 800;
  color: #1a202c;
  margin-top: 10px;
}

/* Rejilla de Gráficas */
.row { display: flex; flex-wrap: wrap; margin: 0 -15px; }
.col-12 { flex: 0 0 100%; max-width: 100%; padding: 0 15px; }

.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}

@media (max-width: 992px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>