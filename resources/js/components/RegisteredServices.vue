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
          <button @click="openModal()" class="btn-add">+ Agregar</button>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="servicios.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">No se encontraron servicios registrados</td>
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
                <td><button @click="openModal(s)" class="btn-edit">Editar</button></td>
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
          <h3>{{ editMode ? 'Editar Servicio' : 'Agregar Servicio' }}</h3>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-3">
            <label class="flabel">ID *</label>
            <input type="text" v-model="form._id" class="styled-input" :disabled="editMode" :class="{ 'input-disabled': editMode }" required>
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Nombre del Servicio *</label>
            <input type="text" v-model="form.nombre_servicio" class="styled-input" required>
          </div>
          <div class="form-group mb-3">
            <label class="flabel">IP Autorizada</label>
            <input type="text" v-model="form.ip_autorizada" class="styled-input" placeholder="Ej. 192.168.1.10">
          </div>
          <div class="form-group mb-3">
            <label class="flabel">Usuarios Autorizados <small>(separados por coma)</small></label>
            <input type="text" v-model="form.usuarios_autorizados" class="styled-input" placeholder="Ej. USUARIO1, USUARIO2">
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
          <button @click="saveServicio" class="btn-save" :disabled="saving">
            {{ saving ? 'Guardando...' : (editMode ? 'Guardar Cambios' : 'Crear Servicio') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../apiService.js';

const CACHE_KEY = 'servicios_cache';
const REFRESH_MS = 5 * 60 * 1000;

export default {
  name: 'RegisteredServices',
  data() {
    return {
      servicios: [], loading: false, error: '',
      showModal: false, editMode: false, saving: false,
      modalMsg: '', modalMsgType: 'success',
      u2version: '',
      form: { _id: '', nombre_servicio: '', ip_autorizada: '', usuarios_autorizados: '', activo: '1' }
    };
  },
  mounted() {
    this._isMounted = true;
    const cached = this.getCachedData();
    if (cached) { this.servicios = cached; } else { this.loading = true; }
    this.loadServicios();
    this._refreshInterval = setInterval(() => this.loadServicios(), REFRESH_MS);
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
    async loadServicios() {
      try {
        const data = await apiService.getServiciosRegistrados();
        if (data?.length > 0) this.setCachedData(data);
        if (!this._isMounted) return;
        this.servicios = data;
        this.error = '';
      } catch {
        if (this._isMounted) this.error = 'No se pudo cargar la lista de servicios.';
      } finally {
        if (this._isMounted) this.loading = false;
      }
    },
    formatUsuarios(usuarios) {
      if (!usuarios) return '—';
      if (Array.isArray(usuarios)) return usuarios.flat().filter(Boolean).join(', ') || '—';
      return usuarios;
    },
    async openModal(s = null) {
      this.editMode = !!s;
      this.modalMsg = '';
      if (s) {
        try {
          const fresh = await apiService.getServicioRegistradoById(s._id);
          this.u2version = fresh.u2version || '';
          this.form = { _id: fresh._id, nombre_servicio: fresh.nombre_servicio || '', ip_autorizada: fresh.ip_autorizada || '', usuarios_autorizados: this.formatUsuarios(fresh.usuarios_autorizados), activo: fresh.activo || '1' };
        } catch {
          this.u2version = s.u2version || '';
          this.form = { _id: s._id, nombre_servicio: s.nombre_servicio || '', ip_autorizada: s.ip_autorizada || '', usuarios_autorizados: this.formatUsuarios(s.usuarios_autorizados), activo: s.activo || '1' };
        }
      } else {
        this.u2version = '';
        this.form = { _id: '', nombre_servicio: '', ip_autorizada: '', usuarios_autorizados: '', activo: '1' };
      }
      this.showModal = true;
    },
    closeModal() { this.showModal = false; },
    async saveServicio() {
      if (!this.form._id || !this.form.nombre_servicio) {
        this.modalMsg = 'El ID y el nombre del servicio son obligatorios.';
        this.modalMsgType = 'error'; return;
      }
      this.saving = true; this.modalMsg = '';
      try {
        const usuariosArray = this.form.usuarios_autorizados
          ? this.form.usuarios_autorizados.split(',').map(s => s.trim()).filter(Boolean).map(u => [u])
          : [];
        const payload = {
          _id:                  this.form._id,
          nombre_servicio:      this.form.nombre_servicio,
          ip_autorizada:        this.form.ip_autorizada,
          usuarios_autorizados: usuariosArray,
          activo:               this.form.activo
        };
        if (this.editMode) await apiService.updateServicioRegistrado(this.form._id, payload, this.u2version);
        else await apiService.createServicioRegistrado(payload);
        this.modalMsg = this.editMode ? 'Servicio actualizado.' : 'Servicio creado.';
        this.modalMsgType = 'success';
        await this.loadServicios();
        this._closeTimer = setTimeout(() => this.closeModal(), 1200);
      } catch {
        this.modalMsg = 'Error al guardar. Verifica los datos.';
        this.modalMsgType = 'error';
      } finally { this.saving = false; }
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
.text-mono { font-family: 'Courier New', monospace; font-weight: 600; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: .8rem; font-weight: 600; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }
.table-responsive { width: 100%; overflow-x: auto; }
.text-center { text-align: center; } .text-muted { color: #718096; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.p-4 { padding: 1rem; } .p-0 { padding: 0; } .overflow-hidden { overflow: hidden; } .mb-3 { margin-bottom: 12px; }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-box { background: #fff; border-radius: 12px; width: 480px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
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
