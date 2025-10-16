// danimtz33/gestion-conexiones/gestion-conexiones-e3ac4ad0f9092d596fc6b606c7c8f30222771f08/resources/js/apiService.js

import axios from 'axios';

// **URL BASE DEFINITIVA Y CORREGIDA**
// Importante: Usar una ruta relativa para que el proxy de Vite la intercepte.
const REAL_API_BASE_URL = '/api/DEMORPC'; 

const BASE_URL = REAL_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Mapea y transforma los datos del modelo User.rpc (API) al formato esperado por los componentes (FRONTEND).
 */
function dataMapper(option, apiData, params = {}) { // <-- Acepta parámetros de filtro
    // La API devuelve un array, lo usamos.
    const users = Array.isArray(apiData) ? apiData : apiData.data || [];

    // Mapeo de campos de la API (ej. _id, allowed_conn) a los campos del frontend (ej. username, connectionLimit).
    const mappedUsers = users.map((user, index) => ({
        id: index + 1, 
        username: user._id || `user_${index}`, 
        owner: user.owner || 'N/A',
        description: user.description || 'Sin descripción',
        connectionLimit: parseInt(user.allowed_conn, 10) || 0,
        status: user.allowed_conn && parseInt(user.allowed_conn, 10) > 0 ? 'Activo' : 'Inactivo', 
        api_id: user._id, 
        ip_address: user.ip_address || 'N/A',
        conn_history: user.conn_history || [],
        u2version: user.u2version || null, // Clave para el encabezado If-Match
    }));


    if (option === 'GET_USERS') {
        return mappedUsers;
    }

    if (option === 'GET_DASHBOARD') {
        const activeConnections = mappedUsers.filter(u => u.status === 'Activo').length;
        const uniqueUsers = mappedUsers.length;
        const failedConnections = 3; 

        const recentActivity = mappedUsers.slice(0, 3).map((u, index) => ({
            id: index + 1,
            user: u.username,
            ip: u.ip_address,
            status: 'Conectado'
        }));
        
        return {
            kpis: { activeConnections, uniqueUsers, failedConnections },
            recentActivity: recentActivity
        };
    }

    if (option === 'GET_HISTORY') {
        // --- INICIO DE LÓGICA DE HISTORIAL AMPLIADA Y SIMULACIÓN DE FILTRADO ---
        
        // 1. Generamos un historial simulado con los nuevos campos (Duración y Motivo)
        let history = [];
        mappedUsers.forEach(u => {
            // Simulación de registros de historial para un usuario (Exitoso)
            history.push({
                id: history.length + 1,
                user: u.username,
                ip: u.ip_address,
                timestamp: '2025-09-30 14:30:15',
                status: 'Exitoso',
                duration: '01:23:45', // Nuevo campo
                disconnectionReason: 'Cierre de sesión manual' // Nuevo campo
            });
            // Simulación de un registro (Fallido)
            history.push({
                id: history.length + 1,
                user: u.username,
                ip: '10.0.0.' + (u.id * 2),
                timestamp: '2025-09-29 09:10:00',
                status: 'Fallido',
                duration: '00:00:05', // Nuevo campo
                disconnectionReason: 'Credenciales inválidas' // Nuevo campo
            });
            // Simulación de otro registro exitoso
            history.push({
                id: history.length + 1,
                user: u.username,
                ip: '10.0.0.' + (u.id * 2),
                timestamp: '2025-09-29 10:00:00',
                status: 'Exitoso',
                duration: '00:15:30', // Nuevo campo
                disconnectionReason: 'Conexión por inactividad' // Nuevo campo
            });
        });
        
        // 2. Simulación de Filtrado por texto (Usuario o IP)
        const filterText = params.search ? params.search.toLowerCase() : '';

        if (filterText) {
            history = history.filter(item => 
                item.user.toLowerCase().includes(filterText) || 
                item.ip.includes(filterText)
            );
        }
        
        // 3. Devolvemos el historial filtrado
        return history;
        // --- FIN DE LÓGICA DE HISTORIAL AMPLIADA Y SIMULACIÓN DE FILTRADO ---
    }
    
    return mappedUsers;
}


export default {
  // Maneja peticiones de lectura (Dashboard, UserList, History) usando GET /User.rpc
  async getData(p_option, p_parameters = {}) {
    console.log(`Llamada API (GET /User.rpc) con opción: ${p_option}. Base URL: ${BASE_URL}`);
    
    try {
        const response = await apiClient.get('/User.rpc', { params: p_parameters }); 
        
        // Pasamos los parámetros de filtro a dataMapper para que pueda aplicarlos (en la simulación)
        const mappedData = dataMapper(p_option, response.data, p_parameters);
        
        return { data: mappedData }; 
        
    } catch (error) {
        console.error(`Error de conexión o API para ${p_option}:`, error);
        throw error; 
    }
  },

  // Maneja la actualización de un usuario usando PATCH /User.rpc/{id}
  async patchUser(userApiId, u2version, updatePayload) {
    const url = `/User.rpc/${userApiId}`;
    console.log(`Llamada API (PATCH ${url}). Base URL: ${BASE_URL}`);

    // Requerido por la documentación para control de concurrencia
    const config = {
        headers: {
            'If-Match': u2version
        }
    };

    try {
      // Mapear el payload al formato de la API
      const apiPayload = {
          description: updatePayload.description,
          allowed_conn: String(updatePayload.connectionLimit), // Asegurar que sea string si la API lo requiere
      };
      
      const response = await apiClient.patch(url, apiPayload, config);
      return response.data;
      
    } catch (error) {
      console.error(`Error en la llamada PATCH a ${url}:`, error);
      throw error;
    }
  }
};
