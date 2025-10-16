<template>
  <div class="security-container">
    <h1>Módulo de Seguridad</h1>
    <p>Gestión de usuarios del sistema (Administradores, Operadores) y sus roles de acceso.</p>

    <div class="header-actions">
      <button @click="openCreateUserModal" class="button-primary">
        + Dar de Alta Nuevo Usuario
      </button>
    </div>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Última Conexión</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in systemUsers" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="['status', user.status === 'Activo' ? 'status-active' : 'status-inactive']">
                {{ user.status }}
              </span>
            </td>
            <td>{{ user.lastLogin }}</td>
            <td>
              <button @click="openEditModal(user)" class="action-button">Editar/Roles</button>
              <button @click="toggleStatus(user)" :class="[user.status === 'Activo' ? 'button-danger' : 'button-success']">
                {{ user.status === 'Activo' ? 'Desactivar' : 'Activar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Modal :show="isModalVisible" @close="closeModal">
    <template v-slot:header>
      <h3>{{ isEditMode ? 'Editar Usuario del Sistema' : 'Dar de Alta Usuario' }}</h3>
    </template>
    <template v-slot:body>
      <form>
        <div class="form-group">
          <label for="userName">Nombre</label>
          <input type="text" id="userName" v-model="form.name">
        </div>
        <div class="form-group">
          <label for="userEmail">Email</label>
          <input type="email" id="userEmail" v-model="form.email">
        </div>
        <div class="form-group">
          <label for="userRole">Rol</label>
          <select id="userRole" v-model="form.role">
            <option value="Administrador">Administrador</option>
            <option value="Operador">Operador</option>
            <option value="Auditor">Auditor</option>
          </select>
        </div>
        <div class="form-group" v-if="!isEditMode || showPasswordFields">
          <label for="userPassword">Contraseña</label>
          <input type="password" id="userPassword" v-model="form.password">
        </div>
         <button v-if="isEditMode" @click.prevent="showPasswordFields = !showPasswordFields" class="button-link">
             {{ showPasswordFields ? 'Ocultar campos de contraseña' : 'Cambiar Contraseña' }}
        </button>
      </form>
    </template>
    <template v-slot:footer>
      <button @click="closeModal" class="button-secondary">Cancelar</button>
      <button @click="saveUser" class="button-primary">Guardar</button>
    </template>
  </Modal>
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
      this.form = { ...user, password: '' }; // Carga los datos del usuario para editar
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.showPasswordFields = false;
    },
    saveUser() {
      // **Simulación de Módulo 6: Alta/Edición de Usuario**
      console.log('Guardando usuario:', this.form);
      alert(this.isEditMode ? 'Usuario actualizado con éxito (Simulación).' : 'Usuario dado de alta con éxito (Simulación).');
      this.closeModal();
    },
    toggleStatus(user) {
      // **Simulación de Módulo 6: Desactivar/Activar**
      user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo';
      alert(`Usuario ${user.name} ha sido ${user.status === 'Activo' ? 'activado' : 'desactivado'} (Simulación).`);
    }
  }
};
</script>

<style scoped>
.security-container {
  font-family: sans-serif;
  max-width: 1000px;
  margin: 40px auto;
}
.header-actions {
    margin-bottom: 20px;
    text-align: right;
}
.button-primary {
  padding: 10px 15px; 
  border: none; 
  background-color: #007bff; 
  color: white; 
  border-radius: 5px; 
  cursor: pointer;
  transition: background-color 0.3s;
}
.user-table {
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
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}
th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.status-active {
  background-color: #e2f5ea;
  color: #34a853;
}
.status-inactive {
  background-color: #f8e1e1;
  color: #ea4335;
}
.action-button {
    padding: 5px 10px;
    background-color: #ffc107;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 8px; /* <-- Margen a la derecha del primer botón */
    margin-bottom: 4px; /* <-- Pequeño margen inferior para separación en líneas */
}
.button-danger {
    padding: 5px 10px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 4px; /* <-- Pequeño margen inferior */
}
.button-success {
    padding: 5px 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 4px; /* <-- Pequeño margen inferior */
}
.button-link {
    background: none;
    border: none;
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    margin-top: 5px;
    display: block;
}
/* Estilos para el Modal (necesarios para los inputs) */
.form-group {
    margin-bottom: 15px;
}
.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}
.form-group input, .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}
.button-secondary { 
  padding: 10px 15px; 
  border: 1px solid #ccc; 
  background-color: #f8f9fa; 
  border-radius: 5px; 
  cursor: pointer; 
  margin-right: 10px; 
}
</style>