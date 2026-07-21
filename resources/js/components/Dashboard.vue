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

      <div class="charts-wrapper">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <div class="card-header-modern justify-content-start mb-4">
              <div class="icon-circle bg-blue-light">
                <i class="bi bi-graph-up text-blue"></i>
              </div>
              <h3>Tendencia de Conexiones (15 días)</h3>
            </div>
            <div class="chart-container">
              <canvas ref="trendsChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <div class="card-header-modern justify-content-start mb-4">
              <div class="icon-circle bg-orange-light">
                <i class="bi bi-hdd-network text-orange"></i>
              </div>
              <h3>Top 5 IPs de Origen Quincenal</h3>
            </div>
            <div class="chart-container">
              <canvas ref="ipsChart"></canvas>
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

const CACHE_KEY = 'dashboard_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

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
  mounted() {
    this._isMounted = true;
    const cached = this.getCachedData();
    if (cached) this.applyData(cached);
    this.loadFreshData();
    this._refreshInterval = setInterval(() => this.loadFreshData(), CACHE_TTL_MS);
  },
  beforeUnmount() {
    this._isMounted = false;
    clearInterval(this._refreshInterval);
    if (this.trendsChartInstance) { this.trendsChartInstance.stop(); this.trendsChartInstance.destroy(); this.trendsChartInstance = null; }
    if (this.ipsChartInstance)    { this.ipsChartInstance.stop();    this.ipsChartInstance.destroy();    this.ipsChartInstance = null; }
  },
  methods: {
    getCachedData() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw).data ?? null;
      } catch {
        return null;
      }
    },

    setCachedData(data) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch { /* quota exceeded, ignorar */ }
    },

    applyData(data) {
      if (!this._isMounted) return;
      this.kpis.activeConnections = data.kpis.activeConnections;
      this.kpis.alerts = data.kpis.alerts;
      const total = data.kpis.totalUsers;
      this.kpis.totalUsers = total > 0 ? total : (this.kpis.totalUsers === '...' ? 0 : this.kpis.totalUsers);
      this.$nextTick(() => {
        if (!this._isMounted) return;
        if (data.charts) this.renderCharts(data.charts);
      });
    },

    async loadFreshData() {
      try {
        const response = await apiService.getData('GET_DASHBOARD');
        if (response?.data?.kpis && response.data.kpis.totalUsers > 0) {
          this.setCachedData(response.data);
        }
        if (!this._isMounted) return;
        if (response?.data?.kpis) this.applyData(response.data);
      } catch (error) {
        if (this._isMounted) console.error("Error cargando dashboard:", error);
      }
    },

    renderCharts(charts) {
      if (!this._isMounted) return;

      const canvas1 = this.$refs.trendsChart;
      if (canvas1 && charts.trends) {
        const existing = Chart.getChart(canvas1);
        if (existing) existing.destroy();

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

      const canvas2 = this.$refs.ipsChart;
      if (canvas2 && charts.topIps) {
        const existing = Chart.getChart(canvas2);
        if (existing) existing.destroy();

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
.charts-wrapper { display: flex; flex-direction: column; gap: 24px; }
.card-body { padding: 24px; }
.mb-4 { margin-bottom: 24px; }

.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}

@media (max-width: 992px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>