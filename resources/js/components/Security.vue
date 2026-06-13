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

      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4 d-flex justify-content-between align-items-center">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="icon-circle bg-blue"><i class="icon">🔒</i></div>
            <h3>Usuarios del Sistema (últimos 10 por último login)</h3>
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
              </tr>
            </thead>
            <tbody>
              <tr v-if="pusers.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">No se encontraron usuarios</td>
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
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <Modal :show="isModalVisible" @close="closeModal">
      <template v-slot:header>
        <h3>Dar de Alta Nuevo Usuario</h3>
      </template>
      <template v-slot:body>
        <form @submit.prevent>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Usuario (@ID) *</label>
            <input type="text" v-model="form._id" class="styled-input" required>
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Nombre</label>
            <input type="text" v-model="form.nombre" class="styled-input">
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">ID</label>
            <input type="text" v-model="form.id" class="styled-input">
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Contraseña *</label>
            <input type="password" v-model="form.contrasena" class="styled-input" required>
          </div>
          <div v-if="saveMessage" :class="['pass-message', saveMessageType]">{{ saveMessage }}</div>
        </form>
      </template>
      <template v-slot:footer>
        <button @click="closeModal" class="btn-cancel">Cancelar</button>
        <button @click="saveUser" class="btn-verify" :disabled="saveLoading">
          {{ saveLoading ? 'Guardando...' : 'Crear Usuario' }}
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
      form: { _id: '', nombre: '', id: '', contrasena: '' }
    };
  },
  mounted() {
    this.loadPusers();
  },
  methods: {
    async loadPusers() {
      this.loadingPusers = true;
      this.pusersError = '';
      try {
        const data = await apiService.getPusers();
        const sorted = [...data].sort((a, b) => {
          const da = a.last_login || '';
          const db = b.last_login || '';
          return db.localeCompare(da);
        });
        this.pusers = sorted.slice(0, 10);
      } catch {
        this.pusersError = 'No se pudo cargar la lista de usuarios.';
      } finally {
        this.loadingPusers = false;
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
      this.form = { _id: '', nombre: '', id: '', contrasena: '' };
      this.saveMessage = '';
      this.isModalVisible = true;
    },

    closeModal() {
      this.isModalVisible = false;
    },

    async saveUser() {
      if (!this.form._id || !this.form.contrasena) {
        this.saveMessage = 'El usuario (@ID) y la contraseña son obligatorios.';
        this.saveMessageType = 'error';
        return;
      }
      this.saveLoading = true;
      this.saveMessage = '';
      try {
        await apiService.createPuser({
          _id: this.form._id,
          nombre: this.form.nombre,
          id: this.form.id,
          contrasena: this.form.contrasena
        });
        this.saveMessage = 'Usuario creado exitosamente.';
        this.saveMessageType = 'success';
        await this.loadPusers();
        setTimeout(() => this.closeModal(), 1200);
      } catch (e) {
        this.saveMessage = 'Error al crear el usuario. Verifica los datos.';
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
.mb-4 { margin-bottom: 1rem; }
.p-4  { padding: 1rem; }
.text-muted { color: #718096; }
.small { font-size: 0.9rem; }
.text-center { text-align: center; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.font-weight-bold { font-weight: 600; }
</style>
