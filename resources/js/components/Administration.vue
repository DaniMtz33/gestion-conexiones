<template>
  <div class="admin-container">
    <h1>Administración</h1>
    <p>Herramientas para la gestión de propietarios, auditoría y políticas de seguridad.</p>

    <div class="admin-card">
      <h2>Configuración de Políticas de Contraseñas</h2>
      <div class="form-group">
        <label for="minlength">Longitud Mínima</label>
        <input type="number" id="minlength" v-model.number="policies.minLength" min="6" max="32">
        <p class="description">Número mínimo de caracteres requeridos para una contraseña.</p>
      </div>
      <div class="form-group">
        <label for="complexity">Complejidad Requerida</label>
        <select v-model="policies.complexity">
          <option value="low">Mínimo 8 caracteres (Baja)</option>
          <option value="medium">Mayúsculas, Minúsculas y Números (Media)</option>
          <option value="high">Mayúsculas, Minúsculas, Números y Símbolos (Alta)</option>
        </select>
        <p class="description">Define los tipos de caracteres necesarios para la validación.</p>
      </div>
       <button @click="savePolicies" class="button-primary save-button">Guardar Políticas</button>
    </div>

    <div class="admin-card">
      <h2>Registro de Cambios (Últimos 10 Eventos)</h2>
      <div class="change-log-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha/Hora</th>
              <th>Usuario Admin</th>
              <th>Acción</th>
              <th>Detalle del Recurso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in changeLog" :key="log.id">
              <td>{{ log.id }}</td>
              <td>{{ log.timestamp }}</td>
              <td>{{ log.adminUser }}</td>
              <td>{{ log.action }}</td>
              <td>{{ log.resourceDetail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-2 text-right">Mostrando {{ changeLog.length }} de 1500 registros.</p>
    </div>
  </div>
</template>

<script>
// El apiService no se modifica para este componente ya que maneja sus propios datos simulados
export default {
  name: 'Administration',
  data() {
    return {
      policies: {
        minLength: 10,
        complexity: 'medium'
      },
      changeLog: [
        { id: 1, timestamp: '2025-10-14 10:00:00', adminUser: 'admin_jose', action: 'UPDATE', resourceDetail: 'Usuario: user_01 - Límite de conexión a 5' },
        { id: 2, timestamp: '2025-10-14 09:45:30', adminUser: 'admin_maria', action: 'LOGIN', resourceDetail: 'Usuario: admin_maria - Sesión iniciada' },
        { id: 3, timestamp: '2025-10-13 18:20:15', adminUser: 'admin_jose', action: 'CREATE', resourceDetail: 'Usuario: user_15 - Propietario: Ventas' },
        { id: 4, timestamp: '2025-10-13 15:00:00', adminUser: 'admin_maria', action: 'UPDATE', resourceDetail: 'Política: Longitud mínima de contraseña a 10' },
      ]
    };
  },
  methods: {
    savePolicies() {
      // **Simulación de Módulo 5: Guardado de Políticas de Contraseña**
      console.log('Guardando políticas de contraseña:', this.policies);
      alert('Políticas de contraseña guardadas (Simulación).');
    }
  }
};
</script>

<style scoped>
.admin-container {
  font-family: sans-serif;
  max-width: 1000px;
  margin: 40px auto;
}
.admin-card {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  border-left: 5px solid #28a745; /* Color diferente para administración */
}
.admin-card h2 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
  color: #333;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #555;
}
.description {
  font-size: 14px;
  color: #777;
  margin-top: 5px;
}
input[type="number"], select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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
.save-button {
    margin-top: 10px;
    width: auto;
}
.change-log-table table {
    width: 100%;
    border-collapse: collapse;
}
.change-log-table th, .change-log-table td {
    text-align: left;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
}
.change-log-table th {
    background-color: #f8f9fa;
    font-weight: 600;
}
.mt-2 {
    margin-top: 20px;
}
.text-right {
    text-align: right;
    font-size: 12px;
    color: #999;
}
</style>