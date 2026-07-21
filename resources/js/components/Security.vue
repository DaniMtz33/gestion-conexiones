<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Módulo de Seguridad</h1>
      <p>Gestión de usuarios del sistema y cambio de contraseña.</p>
    </header>

    <main class="settings-content">

      <section class="card mb-4">
        <div class="card-header p-4">
          <div class="icon-circle bg-blue"><i class="icon">🔑</i></div>
          <h3>Cambiar Contraseña</h3>
        </div>
        <div class="p-4">
          <p class="text-muted small mb-3">Usuario en sesión: <strong>{{ currentUser }}</strong></p>
          <form @submit.prevent="submitChangePassword" class="change-pass-form">
            <div class="form-group mb-3">
              <label class="font-weight-bold">Nueva Contraseña</label>
              <input type="password" v-model="passForm.newPass" class="styled-input" required>
            </div>
            <div class="form-group mb-3">
              <label class="font-weight-bold">Confirmar Contraseña</label>
              <input type="password" v-model="passForm.confirmPass" class="styled-input" required>
            </div>
            <div v-if="passMessage" :class="['pass-message', passMessageType]">{{ passMessage }}</div>
            <button type="submit" class="btn-verify" :disabled="passLoading">
              {{ passLoading ? 'Guardando...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </div>
      </section>

      <section class="card p-0 overflow-hidden mb-4">
        <div class="card-header p-4 d-flex justify-content-between align-items-center">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="icon-circle bg-blue"><i class="icon">🔒</i></div>
            <h3>Últimos 10 Logins</h3>
          </div>
          <button @click="openCreateUserModal" class="btn-verify">+ Dar de Alta</button>
        </div>

        <div v-if="loadingPusers" class="p-4 text-center text-muted">Cargando usuarios...</div>
        <div v-else-if="pusersError" class="p-4 text-center" style="color:#c53030;">{{ pusersError }}</div>
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>@ID</th>
                <th>NOMBRE</th>
                <th>ID</th>
                <th>LAST LOGIN</th>
                <th>LOGIN ATTEMPT</th>
                <th>LOGGED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pusers.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">No se encontraron usuarios</td>
              </tr>
              <tr v-for="u in pusers" :key="u._id">
                <td class="font-weight-bold">{{ u._id }}</td>
                <td>{{ u.nombre || '—' }}</td>
                <td>{{ u.id || '—' }}</td>
                <td>{{ u.last_login || '—' }}</td>
                <td>{{ u.login_attempt || '—' }}</td>
                <td>
                  <span :class="['status-badge', u.logged === '1' ? 'success' : 'neutral']">
                    {{ u.logged === '1' ? 'SI' : 'NO' }}
                  </span>
                </td>
                <td>
                  <button @click="openEditUserModal(u)" class="btn-edit">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4">
          <div class="icon-circle bg-blue"><i class="icon">✏️</i></div>
          <h3>Últimas 10 Modificaciones</h3>
          <span class="records-count-mod">{{ modLog.length }} registros</span>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Administrador</th>
                <th>Usuario Modificado</th>
                <th>Cambios Realizados</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="modLog.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">No hay modificaciones registradas en esta sesión</td>
              </tr>
              <tr v-for="(m, i) in modLog" :key="i">
                <td class="text-mono">{{ m.fecha }}</td>
                <td class="font-weight-bold">{{ m.admin }}</td>
                <td>{{ m.usuario }}</td>
                <td class="cambios-cell">{{ m.cambios }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <Modal :show="isModalVisible" @close="closeModal">
      <template v-slot:header>
        <h3>{{ editMode ? 'Editar Usuario' : 'Dar de Alta Nuevo Usuario' }}</h3>
      </template>
      <template v-slot:body>
        <form @submit.prevent>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Usuario *</label>
            <input
              type="text"
              v-model="form.usuario"
              class="styled-input"
              placeholder="Ej. JPEREZ"
              :disabled="editMode"
              :class="{ 'input-disabled': editMode }"
              required
            >
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Nombre completo *</label>
            <input type="text" v-model="form.nombre" class="styled-input" placeholder="Ej. Juan Pérez García" required>
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Contraseña {{ editMode ? '(dejar vacío para no cambiar)' : '*' }}</label>
            <input type="password" v-model="form.clave" class="styled-input" :required="!editMode">
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Rol *</label>
            <select v-model="form.rol" class="styled-input" required>
              <option value="" disabled>Selecciona un rol</option>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="OPERADOR">Operador</option>
            </select>
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Estado *</label>
            <select v-model="form.activo" class="styled-input" required>
              <option value="1">Activo</option>
              <option value="2">Desactivado</option>
            </select>
          </div>
          <div class="form-info mb-3">
            <span class="info-icon">ℹ️</span> Alta realizada por: <strong>{{ currentUser }}</strong>
          </div>
          <div v-if="saveMessage" :class="['pass-message', saveMessageType]">{{ saveMessage }}</div>
        </form>
      </template>
      <template v-slot:footer>
        <button @click="closeModal" class="btn-cancel">Cancelar</button>
        <button @click="saveUser" class="btn-verify" :disabled="saveLoading">
          {{ saveLoading ? 'Guardando...' : (editMode ? 'Guardar Cambios' : 'Crear Usuario') }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from './Modal.vue';
import apiService from '../apiService.js';

export default {
  name: 'Security',
  components: { Modal },
  data() {
    return {
      currentUser: sessionStorage.getItem('app_user') || '',
      passForm: { newPass: '', confirmPass: '' },
      passMessage: '',
      passMessageType: 'success',
      passLoading: false,
      pusers: [],
      loadingPusers: false,
      pusersError: '',
      isModalVisible: false,
      saveLoading: false,
      saveMessage: '',
      saveMessageType: 'success',
      form: { usuario: '', nombre: '', clave: '', rol: '', activo: '1' },
      editMode: false,
      originalForm: {},
      modLog: JSON.parse(localStorage.getItem('security_modlog') || '[]')
    };
  },
  mounted() {
    this._isMounted = true;
    this.loadPusers();
  },
  beforeUnmount() {
    this._isMounted = false;
    clearTimeout(this._closeTimer);
  },
  methods: {
    async loadPusers() {
      try {
        const data = await apiService.getPusers();
        if (!this._isMounted) return;
        const sorted = [...data].sort((a, b) => {
          const da = a.last_login || '';
          const db = b.last_login || '';
          return db.localeCompare(da);
        });
        this.pusers = sorted.slice(0, 10);
        this.pusersError = '';
      } catch {
        if (this._isMounted) this.pusersError = 'No se pudo cargar la lista de usuarios.';
      } finally {
        if (this._isMounted) this.loadingPusers = false;
      }
    },

    async submitChangePassword() {
      if (this.passForm.newPass !== this.passForm.confirmPass) {
        this.passMessage = 'Las contraseñas no coinciden.';
        this.passMessageType = 'error';
        return;
      }
      this.passLoading = true;
      this.passMessage = '';
      try {
        const user = sessionStorage.getItem('app_user') || '';
        const id = sessionStorage.getItem('app_user_id') || '';
        await apiService.changePassword(user, id, this.passForm.newPass);
        this.passMessage = 'Contraseña cambiada exitosamente.';
        this.passMessageType = 'success';
        this.passForm = { newPass: '', confirmPass: '' };
      } catch {
        this.passMessage = 'Error al cambiar la contraseña. Inténtalo de nuevo.';
        this.passMessageType = 'error';
      } finally {
        this.passLoading = false;
      }
    },

    openCreateUserModal() {
      this.editMode = false;
      this.form = { usuario: '', nombre: '', clave: '', rol: '', activo: '1' };
      this.saveMessage = '';
      this.isModalVisible = true;
    },

    openEditUserModal(u) {
      this.editMode = true;
      this.form = { usuario: u._id || '', nombre: u.nombre || '', clave: '', rol: u.rol || '', activo: u.activo || '1' };
      this.originalForm = { nombre: u.nombre || '', rol: u.rol || '', activo: u.activo || '1' };
      this.saveMessage = '';
      this.isModalVisible = true;
    },

    closeModal() {
      this.isModalVisible = false;
    },

    async saveUser() {
      if (!this.editMode && (!this.form.usuario || !this.form.nombre || !this.form.clave || !this.form.rol)) {
        this.saveMessage = 'Usuario, nombre, contraseña y rol son obligatorios.';
        this.saveMessageType = 'error';
        return;
      }
      if (this.editMode && !this.form.usuario) {
        this.saveMessage = 'El usuario es obligatorio.';
        this.saveMessageType = 'error';
        return;
      }
      this.saveLoading = true;
      this.saveMessage = '';
      try {
        const opcion = this.editMode ? 2 : 1;
        const payload = {
          admUsr:  this.currentUser,
          usuario: this.form.usuario,
          nombre:  this.form.nombre,
          rol:     this.form.rol,
          activo:  this.form.activo
        };
        if (this.form.clave) payload.clave = this.form.clave;

        await apiService.adminPusers(opcion, payload);
        this.saveMessage = this.editMode ? 'Usuario actualizado exitosamente.' : 'Usuario creado exitosamente.';
        this.saveMessageType = 'success';
        if (this.editMode) {
          const cambios = [];
          if (this.form.nombre !== this.originalForm.nombre) cambios.push(`NOMBRE: "${this.originalForm.nombre}" → "${this.form.nombre}"`);
          if (this.form.rol    !== this.originalForm.rol)    cambios.push(`ROL: "${this.originalForm.rol}" → "${this.form.rol}"`);
          if (this.form.activo !== this.originalForm.activo) cambios.push(`ACTIVO: ${this.originalForm.activo === '1' ? 'Activo' : 'Desactivado'} → ${this.form.activo === '1' ? 'Activo' : 'Desactivado'}`);
          if (this.form.clave) cambios.push('CLAVE: (actualizada)');
          this.modLog.unshift({ fecha: new Date().toLocaleString('es-MX'), admin: this.currentUser, usuario: this.form.usuario, cambios: cambios.length ? cambios.join(' | ') : 'Sin cambios detectados' });
          if (this.modLog.length > 10) this.modLog = this.modLog.slice(0, 10);
          localStorage.setItem('security_modlog', JSON.stringify(this.modLog));
        }
        await this.loadPusers();
        this._closeTimer = setTimeout(() => this.closeModal(), 1500);
      } catch {
        this.saveMessage = this.editMode
          ? 'Error al actualizar el usuario. Verifica los datos e intenta de nuevo.'
          : 'Error al crear el usuario. Verifica los datos e intenta de nuevo.';
        this.saveMessageType = 'error';
      } finally {
        this.saveLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.settings-page {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
  color: #2d3748;
}
.settings-header { margin-bottom: 30px; text-align: center; }
.settings-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.settings-header p { color: #718096; }
.card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); border: 1px solid #edf2f7; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.card-header h3 { font-size: 1.05rem; font-weight: 600; margin: 0; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.icon-circle { width: 36px; height: 36px; background: #ebf8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.bg-blue { background: #ebf8ff; color: #4299e1; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f7fafc; padding: 15px; text-align: left; font-size: 0.85rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: .025em; }
.custom-table td { padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 0.95rem; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.neutral { background: #f7fafc; color: #718096; }
.table-responsive { width: 100%; overflow-x: auto; }
.btn-verify { background: #4299e1; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.15s; white-space: nowrap; }
.btn-verify:hover { background: #3182ce; }
.btn-verify:active { background: #2b6cb0; }
.btn-cancel { background: #edf2f7; color: #4a5568; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-cancel:hover { background: #e2e8f0; }
.styled-input { width: 100%; padding: 10px 14px; border: 2px solid #edf2f7; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; transition: all 0.2s; }
.styled-input:focus { outline: none; border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66,153,225,.15); }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.font-weight-bold { font-weight: 700; font-size: 0.85rem; color: #4a5568; text-transform: uppercase; letter-spacing: .025em; }
.change-pass-form { max-width: 400px; }
.pass-message { padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; margin-bottom: 12px; }
.pass-message.success { background: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }
.pass-message.error   { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.mb-3 { margin-bottom: 12px; }
.form-info { font-size: 0.85rem; color: #718096; background: #f7fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #edf2f7; }
.records-count-mod { margin-left: auto; background: #f7fafc; padding: 4px 12px; border-radius: 20px; font-size: .85rem; color: #718096; font-weight: 500; }
.cambios-cell { font-size: 0.85rem; color: #4a5568; max-width: 320px; word-break: break-word; }
.accion-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: .78rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.accion-login   { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }
.accion-logout  { background: #fefcbf; color: #744210; border: 1px solid #f6e05e; }
.accion-create  { background: #faf5ff; color: #553c9a; border: 1px solid #d6bcfa; }
.accion-update  { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }
.accion-delete  { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.accion-default { background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; }
.btn-edit { background: #ebf8ff; color: #3182ce; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-edit:hover { background: #bee3f8; }
.input-disabled { background: #f7fafc; color: #718096; cursor: not-allowed; }
.mb-4 { margin-bottom: 1rem; }
.p-4  { padding: 1rem; }
.text-muted { color: #718096; }
.small { font-size: 0.9rem; }
.text-center { text-align: center; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.font-weight-bold { font-weight: 600; }
</style>
