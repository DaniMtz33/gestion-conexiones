<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Servicios Registrados</h1>
      <p>Listado de servicios configurados en el servidor RPC.</p>
    </header>

    <main class="settings-content">
      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4">
          <div class="icon-circle"><i>🖧</i></div>
          <h3>Servicios</h3>
          <span class="records-count">{{ servicios.length }} registros</span>
        </div>

        <div v-if="loading" class="p-4 text-center text-muted">Cargando servicios...</div>
        <div v-else-if="error" class="p-4 text-center" style="color:#c53030;">{{ error }}</div>
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Servicio</th>
                <th>IP Autorizada</th>
                <th>Usuarios Autorizados</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="servicios.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No se encontraron servicios registrados</td>
              </tr>
              <tr v-for="s in servicios" :key="s._id">
                <td class="font-weight-bold">{{ s._id }}</td>
                <td>{{ s.nombre_servicio || '—' }}</td>
                <td class="text-mono">{{ s.ip_autorizada || '—' }}</td>
                <td>{{ formatUsuarios(s.usuarios_autorizados) }}</td>
                <td>
                  <span :class="['status-badge', s.activo === '1' ? 'success' : 'error']">
                    {{ s.activo === '1' ? 'SI' : 'NO' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import apiService from '../apiService.js';

export default {
  name: 'RegisteredServices',
  data() {
    return { servicios: [], loading: false, error: '' };
  },
  mounted() {
    this.loadServicios();
  },
  methods: {
    async loadServicios() {
      this.loading = true;
      this.error = '';
      try {
        this.servicios = await apiService.getServiciosRegistrados();
      } catch {
        this.error = 'No se pudo cargar la lista de servicios.';
      } finally {
        this.loading = false;
      }
    },
    formatUsuarios(usuarios) {
      if (!usuarios) return '—';
      if (Array.isArray(usuarios)) return usuarios.flat().filter(Boolean).join(', ') || '—';
      return usuarios;
    }
  }
};
</script>

<style scoped>
.settings-page { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; color: #2d3748; }
.settings-header { margin-bottom: 30px; text-align: center; }
.settings-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.settings-header p { color: #718096; }
.card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); border: 1px solid #edf2f7; }
.card-header { display: flex; align-items: center; gap: 12px; padding: 1rem; }
.card-header h3 { font-size: 1.05rem; font-weight: 600; margin: 0; }
.icon-circle { width: 36px; height: 36px; background: #ebf8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.records-count { margin-left: auto; background: #f7fafc; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #718096; font-weight: 500; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f7fafc; padding: 15px; text-align: left; font-size: 0.85rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: .025em; }
.custom-table td { padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 0.95rem; }
.font-weight-bold { font-weight: 600; }
.text-mono { font-family: 'Courier New', monospace; font-weight: 600; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }
.table-responsive { width: 100%; overflow-x: auto; }
.text-center { text-align: center; }
.text-muted { color: #718096; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.p-4 { padding: 1rem; }
.p-0 { padding: 0; }
.overflow-hidden { overflow: hidden; }
</style>
