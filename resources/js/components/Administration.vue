<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Administración</h1>
      <p>Herramientas para la gestión de propietarios, auditoría y políticas de seguridad.</p>
    </header>

    <main class="settings-content">
      <section class="card mb-4 border-green">
        <div class="card-header">
          <div class="icon-circle bg-green">
            <i class="icon">🛡️</i>
          </div>
          <h2>Configuración de Políticas de Contraseñas</h2>
        </div>
        
        <div class="settings-grid">
          <div class="form-group">
            <label for="minlength">Longitud Mínima</label>
            <input 
              type="number" 
              id="minlength" 
              v-model.number="policies.minLength" 
              min="6" 
              max="32"
              class="styled-input"
            >
            <p class="description">Número mínimo de caracteres requeridos para una contraseña.</p>
          </div>

          <div class="form-group">
            <label for="complexity">Complejidad Requerida</label>
            <div class="select-wrapper">
              <select v-model="policies.complexity" id="complexity" class="styled-input">
                <option value="low">Mínimo 8 caracteres (Baja)</option>
                <option value="medium">Mayúsculas, Minúsculas y Números (Media)</option>
                <option value="high">Mayúsculas, Minúsculas, Números y Símbolos (Alta)</option>
              </select>
            </div>
            <p class="description">Define los tipos de caracteres necesarios para la validación.</p>
          </div>
        </div>

        <div class="text-right mt-3">
          <button @click="savePolicies" class="btn-save w-auto px-5">
            Guardar Políticas
          </button>
        </div>
      </section>

      <section class="card p-0 overflow-hidden border-blue">
        <div class="card-header p-4 pb-2">
          <div class="icon-circle bg-blue">
            <i class="icon">📜</i>
          </div>
          <h3>Registro de Cambios (Últimos 10 Eventos)</h3>
        </div>
        
        <div class="table-responsive">
          <table class="custom-table">
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
                <td class="font-weight-bold">#{{ log.id }}</td>
                <td>{{ log.timestamp }}</td>
                <td class="text-primary font-weight-bold">{{ log.adminUser }}</td>
                <td>
                  <span :class="['action-badge', log.action.toLowerCase()]">
                    {{ log.action }}
                  </span>
                </td>
                <td class="text-muted small">{{ log.resourceDetail }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-3 bg-light text-right">
          <span class="records-info">Mostrando {{ changeLog.length }} de 1500 registros.</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
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
      console.log('Guardando políticas de contraseña:', this.policies);
      alert('Políticas de contraseña guardadas (Simulación).');
    }
  }
};
</script>

<style scoped>
/* Unificación con ConnectionSettings.vue */
.settings-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Inter', -apple-system, sans-serif;
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
  margin-bottom: 24px;
  border: 1px solid #edf2f7;
}

.border-green { border-left: 5px solid #48bb78; }
.border-blue { border-left: 5px solid #4299e1; }

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header h2, .card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.bg-green { background: #f0fff4; color: #48bb78; }
.bg-blue { background: #ebf8ff; color: #4299e1; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
}

.styled-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.styled-input:focus {
  outline: none;
  border-color: #4299e1;
}

.description {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 6px;
}

/* Tabla Estilizada */
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
}

.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #edf2f7;
  font-size: 0.9rem;
}

.action-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.update { background: #ebf8ff; color: #3182ce; }
.login { background: #f0fff4; color: #38a169; }
.create { background: #faf5ff; color: #805ad5; }

/* Botones */
.btn-save {
  background: #2d3748;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover { background: #1a202c; }

.text-right { text-align: right; }
.records-info { font-size: 0.8rem; color: #a0aec0; }
.table-responsive { width: 100%; overflow-x: auto; }

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>