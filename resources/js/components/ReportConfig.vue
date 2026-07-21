<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Configuración de Reportes</h1>
      <p>Gestión de reportes automáticos y sus destinatarios.</p>
    </header>

    <main class="settings-content">
      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4">
          <div class="icon-circle"><i>📋</i></div>
          <h3>Reportes Configurados</h3>
          <span class="records-count">{{ reportes.length }} registros</span>
          <button @click="openModal()" class="btn-add">+ Agregar</button>
        </div>

        <div v-if="loading" class="p-4 text-center text-muted">Cargando reportes...</div>
        <div v-else-if="error" class="p-4 text-center" style="color:#c53030;">{{ error }}</div>
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Frecuencia</th>
                <th>Formato</th>
                <th>Destinatarios</th>
                <th>Servicios Asociados</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportes.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">No se encontraron reportes configurados</td>
              </tr>
              <tr v-for="r in reportes" :key="r._id">
                <td class="font-weight-bold">{{ r._id }}</td>
                <td>{{ r.frecuencia || '—' }}</td>
                <td>{{ r.formato || '—' }}</td>
                <td>{{ formatDestinatarios(r.destinatarios) }}</td>
                <td>{{ r.servicios_asociados || '—' }}</td>
                <td>
                  <span :class="['status-badge', r.activo === '1' ? 'success' : 'error']">
                    {{ r.activo === '1' ? 'SI' : 'NO' }}
                  </span>
                </td>
                <td><button @click="openModal(r)" class="btn-edit">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Modal agregar/editar -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>{{ editMode ? 'Editar Reporte' : 'Agregar Reporte' }}</h3>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-3">
            <label class="flabel">ID *</label>
            <input type="text" v-model="form._id" class="styled-input" :disabled="editMode" :class="{ 'input-disabled': editMode }" required>
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Frecuencia</label>
            <input type="text" v-model="form.frecuencia" class="styled-input" placeholder="Ej. DIARIO, SEMANAL">
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Formato</label>
            <input type="text" v-model="form.formato" class="styled-input" placeholder="Ej. PDF, CSV">
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Destinatarios <small>(separados por coma)</small></label>
            <input type="text" v-model="form.destinatarios" class="styled-input" placeholder="correo1@empresa.com, correo2@empresa.com">
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Servicios Asociados</label>
            <input type="text" v-model="form.servicios_asociados" class="styled-input">
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Activo</label>
            <select v-model="form.activo" class="styled-input">
              <option value="1">SI</option>
              <option value="0">NO</option>
            </select>
          </div>
          <div v-if="modalMsg" :class="['modal-msg', modalMsgType]">{{ modalMsg }}</div>
        </div>
        <div class="modal-foot">
          <button @click="closeModal" class="btn-cancel">Cancelar</button>
          <button @click="saveReporte" class="btn-save" :disabled="saving">
            {{ saving ? 'Guardando...' : (editMode ? 'Guardar Cambios' : 'Crear Reporte') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import apiService from '../apiService.js';

const CACHE_KEY = 'reportes_cache';
const REFRESH_MS = 5 * 60 * 1000;

export default {
  name: 'ReportConfig',
  data() {
    return {
      reportes: [], loading: false, error: '',
      showModal: false, editMode: false, saving: false,
      modalMsg: '', modalMsgType: 'success',
      form: { _id: '', frecuencia: '', formato: '', destinatarios: '', servicios_asociados: '', activo: '1' }
    };
  },
  mounted() {
    this._isMounted = true;
    const cached = this.getCachedData();
    if (cached) { this.reportes = cached; } else { this.loading = true; }
    this.loadReportes();
    this._refreshInterval = setInterval(() => this.loadReportes(), REFRESH_MS);
  },
  beforeUnmount() {
    this._isMounted = false;
    clearInterval(this._refreshInterval);
    clearTimeout(this._closeTimer);
  },
  methods: {
    getCachedData() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw).data ?? null;
      } catch { return null; }
    },
    setCachedData(data) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch { /* quota exceeded */ }
    },
    async loadReportes() {
      try {
        const data = await apiService.getConfigReportes();
        if (data?.length > 0) this.setCachedData(data);
        if (!this._isMounted) return;
        this.reportes = data;
        this.error = '';
      } catch {
        if (this._isMounted) this.error = 'No se pudo cargar la configuración de reportes.';
      } finally {
        if (this._isMounted) this.loading = false;
      }
    },
    formatDestinatarios(dest) {
      if (!dest) return '—';
      if (Array.isArray(dest)) return dest.flat().filter(Boolean).join(', ') || '—';
      return dest;
    },
    openModal(r = null) {
      this.editMode = !!r;
      this.modalMsg = '';
      this.form = r
        ? { _id: r._id, frecuencia: r.frecuencia || '', formato: r.formato || '', destinatarios: this.formatDestinatarios(r.destinatarios), servicios_asociados: r.servicios_asociados || '', activo: r.activo || '1' }
        : { _id: '', frecuencia: '', formato: '', destinatarios: '', servicios_asociados: '', activo: '1' };
      this.showModal = true;
    },
    closeModal() { this.showModal = false; },
    async saveReporte() {
      if (!this.form._id) { this.modalMsg = 'El ID es obligatorio.'; this.modalMsgType = 'error'; return; }
      this.saving = true; this.modalMsg = '';
      try {
        const destArray = this.form.destinatarios
          ? this.form.destinatarios.split(',').map(s => s.trim()).filter(Boolean).map(e => [e])
          : [];
        const payload = {
          frecuencia:          this.form.frecuencia,
          formato:             this.form.formato,
          destinatarios:       destArray,
          servicios_asociados: this.form.servicios_asociados,
          activo:              this.form.activo
        };
        if (this.editMode) {
          // REST PUT — el proxy obtiene u2version automáticamente y añade If-Match
          await apiService.updateConfigReporte(this.form._id, payload);
        } else {
          // Crear vía subrutina (no requiere If-Match)
          await apiService.configRepo('POST', {
            nombre:        this.form._id,
            frecuencia:    this.form.frecuencia,
            formato:       this.form.formato,
            destinatarios: this.form.destinatarios,
            servicios:     this.form.servicios_asociados,
            activo:        this.form.activo
          });
        }
        this.modalMsg = this.editMode ? 'Reporte actualizado.' : 'Reporte creado.';
        this.modalMsgType = 'success';
        await this.loadReportes();
        this._closeTimer = setTimeout(() => this.closeModal(), 1200);
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.errorDetailMessage || e?.response?.data?.message || e?.response?.data?.error || '';
        this.modalMsg = `Error al guardar${status ? ` (${status})` : ''}${msg ? ': ' + msg : '.'}`;
        this.modalMsgType = 'error';
        console.error('saveReporte error:', e?.response ?? e);
      } finally { this.saving = false; }
    },

  }
};
</script>

<style scoped>
.settings-page { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; color: #2d3748; }
.settings-header { margin-bottom: 30px; text-align: center; }
.settings-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.settings-header p { color: #718096; }
.card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); border: 1px solid #edf2f7; }
.card-header { display: flex; align-items: center; gap: 10px; padding: 1rem; }
.card-header h3 { font-size: 1.05rem; font-weight: 600; margin: 0; }
.icon-circle { width: 36px; height: 36px; background: #ebf8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.records-count { background: #f7fafc; padding: 4px 12px; border-radius: 20px; font-size: .85rem; color: #718096; font-weight: 500; }
.btn-add { margin-left: auto; background: #48bb78; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-size: .88rem; font-weight: 600; cursor: pointer; transition: background .15s; white-space: nowrap; }
.btn-add:hover { background: #38a169; }
.btn-edit { background: #ebf8ff; color: #3182ce; border: none; padding: 5px 12px; border-radius: 6px; font-size: .83rem; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-edit:hover { background: #bee3f8; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f7fafc; padding: 13px 15px; text-align: left; font-size: .85rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: .025em; }
.custom-table td { padding: 13px 15px; border-bottom: 1px solid #edf2f7; font-size: .93rem; }
.font-weight-bold { font-weight: 600; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: .8rem; font-weight: 600; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }
.table-responsive { width: 100%; overflow-x: auto; }
.text-center { text-align: center; }
.text-muted { color: #718096; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.p-4 { padding: 1rem; } .p-0 { padding: 0; } .overflow-hidden { overflow: hidden; } .mb-3 { margin-bottom: 12px; }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-box { background: #fff; border-radius: 12px; width: 500px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid #edf2f7; }
.modal-head h3 { font-size: 1.05rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #718096; }
.modal-body { padding: 20px; max-height: 65vh; overflow-y: auto; }
.modal-foot { padding: 14px 20px; border-top: 1px solid #edf2f7; display: flex; justify-content: flex-end; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.flabel { font-size: .82rem; font-weight: 700; color: #4a5568; text-transform: uppercase; letter-spacing: .025em; }
.flabel small { font-weight: 400; text-transform: none; color: #a0aec0; }
.styled-input { width: 100%; padding: 9px 13px; border: 2px solid #edf2f7; border-radius: 8px; font-size: .93rem; box-sizing: border-box; transition: all .2s; }
.styled-input:focus { outline: none; border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66,153,225,.15); }
.input-disabled { background: #f7fafc; color: #718096; cursor: not-allowed; }
.btn-cancel { background: #edf2f7; color: #4a5568; border: 1px solid #e2e8f0; padding: 9px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-save { background: #4299e1; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-save:hover:not(:disabled) { background: #3182ce; }
.btn-save:disabled { opacity: .6; cursor: not-allowed; }
.modal-msg { padding: 9px 13px; border-radius: 8px; font-size: .87rem; font-weight: 600; margin-top: 10px; }
.modal-msg.success { background: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }
.modal-msg.error { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
</style>
