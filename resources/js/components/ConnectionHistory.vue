// resources/js/components/ConnectionHistory.vue

<template>
  <div class="history-container">
    <h1>Historial de Conexiones</h1>
    <p>Registro histórico de todos los intentos de conexión al servidor.</p>
    
    <div class="filter-controls">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar por Usuario o IP de Origen..."
        class="filter-input"
      />
      <label for="dateRange" class="date-label">Rango de Fechas:</label>
      <input 
        type="text" 
        v-model="dateRange" 
        placeholder="dd/mm/aaaa - dd/mm/aaaa"
        class="filter-input date-input"
      />
      <button @click="fetchHistory" class="apply-filter-button">Aplicar Filtros</button>
    </div>
    <div class="history-table">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>IP de Origen</th>
            <th>Fecha y Hora</th>
            <th>Resultado</th>
            <th>Duración</th> 
            <th>Motivo de desconexión</th> 
          </tr>
        </thead>
        <tbody>
          <tr v-for="conn in connections" :key="conn.id">
            <td>{{ conn.user }}</td>
            <td>{{ conn.ip }}</td>
            <td>{{ conn.timestamp }}</td>
            <td>
              <span :class="['status', conn.status === 'Exitoso' ? 'status-success' : 'status-failed']">
                {{ conn.status }}
              </span>
            </td>
            <td>{{ conn.duration || 'N/A' }}</td>
            <td>{{ conn.disconnectionReason || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// 1. IMPORTAMOS EL SERVICIO
import apiService from '../apiService';

export default {
  name: 'ConnectionHistory',
  data() {
    return {
      connections: [],
      // Nuevos datos para el filtrado
      searchQuery: '',
      dateRange: ''
    };
  },
  mounted() {
    // Carga inicial sin filtros
    this.fetchHistory();
  },
  methods: {
    // 2. MODIFICAMOS EL MÉTODO PARA USAR LOS PARÁMETROS DE FILTRO
    async fetchHistory() {
      try {
        const params = {
            // Pasamos los valores de los inputs como parámetros
            search: this.searchQuery,
            dateRange: this.dateRange
        };
        // Enviamos los parámetros a getData para que la capa de servicio los use
        const response = await apiService.getData('GET_HISTORY', params);
        this.connections = response.data;
      } catch (error) {
        console.error("Hubo un error al obtener el historial:", error);
      }
    }
  }
};
</script>

<style scoped>
/* Puedes añadir estilos similares a UserList.vue o personalizarlos */
.history-container {
  font-family: sans-serif;
  max-width: 1200px; /* Aumentamos el tamaño para los filtros */
  margin: 40px auto;
  padding: 20px;
}
.filter-controls {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
    align-items: center;
}
.filter-input {
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    flex-grow: 1;
    max-width: 300px;
}
.date-input {
    max-width: 200px;
}
.date-label {
    font-weight: bold;
    color: #555;
    white-space: nowrap;
}
.apply-filter-button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}
.apply-filter-button:hover {
    background-color: #0056b3;
}
.history-table {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow-x: auto; /* Para tablas anchas */
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
.status-success {
  background-color: #e2f5ea;
  color: #34a853;
}
.status-failed {
  background-color: #f8e1e1;
  color: #ea4335;
}
</style>