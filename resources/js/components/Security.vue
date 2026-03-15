<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Módulo de Seguridad</h1>
      <p>Gestión de usuarios del sistema (Administradores, Operadores) y sus roles de acceso.</p>
    </header>

    <main class="settings-content">
      <div class="text-right mb-4">
        <button @click="openCreateUserModal" class="btn-verify">
          + Dar de Alta Nuevo Usuario
        </button>
      </div>

      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4">
          <div class="icon-circle bg-blue">
            <i class="icon">🔒</i>
          </div>
          <h3>Usuarios del Sistema</h3>
        </div>
        
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Última Conexión</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in systemUsers" :key="user.id">
                <td class="font-weight-bold text-dark">{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge">{{ user.role }}</span>
                </td>
                <td>
                  <span :class="['status-badge', user.status === 'Activo' ? 'success' : 'error']">
                    {{ user.status }}
                  </span>
                </td>
                <td class="text-muted small">{{ user.lastLogin }}</td>
                <td class="text-center">
                  <div class="btn-group">
                    <button @click="openEditModal(user)" class="btn-action edit">
                      Editar/Roles
                    </button>
                    <button 
                      @click="toggleStatus(user)" 
                      :class="['btn-status', user.status === 'Activo' ? 'deactivate' : 'activate']"
                    >
                      {{ user.status === 'Activo' ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <Modal :show="isModalVisible" @close="closeModal">
      <template v-slot:header>
        <h3>{{ isEditMode ? 'Editar Usuario del Sistema' : 'Dar de Alta Usuario' }}</h3>
      </template>
      
      <template v-slot:body>
        <form>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Nombre</label>
            <input type="text" v-model="form.name" class="styled-input">
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Email</label>
            <input type="email" v-model="form.email" class="styled-input">
          </div>
          <div class="form-group mb-3">
            <label class="font-weight-bold">Rol</label>
            <div class="select-wrapper">
              <select v-model="form.role" class="styled-input">
                <option value="Administrador">Administrador</option>
                <option value="Operador">Operador</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>
          </div>
          <div class="form-group mb-2" v-if="!isEditMode || showPasswordFields">
            <label class="font-weight-bold">Contraseña</label>
            <input type="password" v-model="form.password" class="styled-input">
          </div>
          <button v-if="isEditMode" @click.prevent="showPasswordFields = !showPasswordFields" class="btn-link">
            {{ showPasswordFields ? 'Ocultar campos de contraseña' : 'Cambiar Contraseña' }}
          </button>
        </form>
      </template>
      
      <template v-slot:footer>
        <button @click="closeModal" class="btn-cancel">Cancelar</button>
        <button @click="saveUser" class="btn-verify">Guardar Usuario</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from './Modal.vue';

export default {
  name: 'Security',
  components: { Modal },
  data() {
    return {
      systemUsers: [
        { id: 1, name: 'Admin Principal', email: 'admin@example.com', role: 'Administrador', status: 'Activo', lastLogin: '2025-10-14 10:00:00' },
        { id: 2, name: 'Operador Ventas', email: 'op_ventas@example.com', role: 'Operador', status: 'Inactivo', lastLogin: '2025-09-01 12:30:00' },
        { id: 3, name: 'Auditor Externo', email: 'auditor@example.com', role: 'Auditor', status: 'Activo', lastLogin: '2025-10-13 14:00:00' },
      ],
      isModalVisible: false,
      isEditMode: false,
      showPasswordFields: false,
      form: { id: null, name: '', email: '', role: 'Operador', password: '' }
    };
  },
  methods: {
    openCreateUserModal() {
      this.isEditMode = false;
      this.showPasswordFields = true;
      this.form = { id: null, name: '', email: '', role: 'Operador', password: '' };
      this.isModalVisible = true;
    },
    openEditModal(user) {
      this.isEditMode = true;
      this.showPasswordFields = false;
      this.form = { ...user, password: '' }; 
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.showPasswordFields = false;
    },
    saveUser() {
      console.log('Guardando usuario:', this.form);
      alert(this.isEditMode ? 'Usuario actualizado con éxito (Simulación).' : 'Usuario dado de alta con éxito (Simulación).');
      this.closeModal();
    },
    toggleStatus(user) {
      user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      alert(`Usuario ${user.name} ha sido ${user.status === 'Activo' ? 'activado' : 'desactivado'} (Simulación).`);
    }
  }
};
</script>

<style scoped>
.settings-page {
  max-width: 1000px;
  margin: 40px auto;
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
  margin-bottom: 8px;
}

.settings-header p {
  color: #718096;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #edf2f7;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.icon-circle {
  width: 36px;
  height: 36px;
  background: #ebf8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-blue { background: #ebf8ff; color: #4299e1; }

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  background-color: #f7fafc;
  padding: 15px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #edf2f7;
  font-size: 0.95rem;
}

.role-badge {
  background: #f7fafc;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }

.btn-group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.btn-action {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-action.edit { background: #ebf8ff; color: #3182ce; }

.btn-status {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  min-width: 90px;
}

.btn-status.deactivate { background: #fff5f5; color: #e53e3e; }
.btn-status.activate { background: #f0fff4; color: #38a169; }

.btn-verify {
  background: #4299e1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 10px;
}

.btn-link {
  background: none;
  border: none;
  color: #4299e1;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  margin-top: 5px;
}

/* --- SOLUCIÓN AL DESBORDE --- */
.styled-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box; /* Asegura que el padding no sume al ancho total */
}

.styled-input:focus {
  outline: none;
  border-color: #4299e1;
}

.text-right { text-align: right; }
.table-responsive { width: 100%; overflow-x: auto; }
</style>