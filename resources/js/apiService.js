import axios from 'axios';

const BASE_URL = '/api/UNIRPC_CONN';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

function getToday() {
    const date = new Date();
    return formatDate(date);
}

function getFirstDayOfMonth() {
    const date = new Date();
    date.setDate(1); 
    return formatDate(date);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function parseStrDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') return null;
    const cleanStr = dateStr.split(' ')[0]; 
    const parts = cleanStr.split('/');
    if (parts.length < 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

// --- HELPER NUEVO: Interpreta el input de fechas (con o sin guion) ---
function processDateInput(inputStr) {
    if (!inputStr || inputStr.length < 8) return null;
    
    let startStr, endStr;

    // Caso 1: Rango "DD/MM/AAAA - DD/MM/AAAA"
    if (inputStr.includes('-')) {
        const parts = inputStr.split('-');
        startStr = parts[0].trim();
        endStr = parts[1] ? parts[1].trim() : startStr; // Si falta la segunda, usa la primera
    } 
    // Caso 2: Fecha única "DD/MM/AAAA"
    else {
        startStr = inputStr.trim();
        endStr = inputStr.trim();
    }

    return { startStr, endStr };
}

// ... (findConnectionData y dataMapper se mantienen IGUAL) ...
function findConnectionData(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.usuario || obj.ip || obj['fecha.ini']) return [obj];
    if (Array.isArray(obj)) {
        if (obj.length > 0 && (obj[0].usuario || obj[0].ip)) return obj;
        return null; 
    }
    const keys = Object.keys(obj);
    for (const key of keys) {
        const result = findConnectionData(obj[key]);
        if (result) return result;
    }
    return null;
}

function dataMapper(option, apiData, params = {}) {
    if (typeof apiData === 'string') {
        try { apiData = JSON.parse(apiData); } catch (e) { /* CSV legacy */ }
    }

    if (option === 'GET_USERS' || option === 'GET_DASHBOARD') {
        const users = apiData['Usuarios.registrados'] || (Array.isArray(apiData) ? apiData : []);
        const mappedUsers = users.map((user, index) => ({
             id: index + 1,
             username: user._id || `user_${index}`,
             name: user.nombre_usuario || user._id,
             owner: user.propietario || 'N/A',
             description: user.observaciones || '',
             connectionLimit: 0,
             status: user.activo === 'SI' ? 'Activo' : 'Inactivo',
             api_id: user._id,
             ip_address: Array.isArray(user.ip_autorizada) ? user.ip_autorizada.join(', ') : (user.ip_autorizada || 'N/A'),
             u2version: user.u2version || null
        }));

        if (option === 'GET_USERS') return mappedUsers;
        if (option === 'GET_DASHBOARD') {
             return { kpis: {activeConnections: 0, uniqueUsers: 0, failedConnections: 0}, recentActivity: [] };
        }
    }

    if (option === 'GET_HISTORY') {
        // Soporte CSV
        if (apiData && typeof apiData.resultados === 'string') {
             let rawString = apiData.resultados;
             if (rawString === "SIN RESULTADOS") return [];
             const rows = rawString.split('þ');
             return rows.filter(r => r.trim() !== '').map((row, index) => {
                const parts = row.split('ý');
                return {
                    id: index + 1,
                    user: parts[2] || 'Desconocido',
                    ip: parts[3] || 'N/A',
                    timestamp: parts[1] || 'N/A',
                    status: parts[5] || 'Desconocido',
                    duration: parts[6] || 'N/A'
                };
             });
        }
        
        let historyList = findConnectionData(apiData);
        if (!historyList) return [];

        return historyList.map((conn, index) => ({
            id: index + 1,
            user: conn.usuario || 'Desconocido',
            ip: conn.ip || 'N/A',
            timestamp: conn['fecha.ini'] ? `${conn['fecha.ini']} ${conn['hora.ini'] || ''}` : 'N/A', 
            status: conn.estado || 'Desconocido',
            duration: conn['fecha.fin'] ? 'Finalizada' : 'En curso'
        }));
    }
    return [];
}

export default {
  async getData(p_option, p_parameters = {}) {
    try {
        let response;

        if (p_option === 'GET_USERS' || p_option === 'GET_DASHBOARD') {
            response = await apiClient.get('/Usuarios.registrados');
        } 
        else if (p_option === 'GET_HISTORY') {
            const todayStr = getToday();
            const firstDayStr = getFirstDayOfMonth();
            
            // Payload base
            const payload = {
                "usuario": "",
                "fecha.ini": firstDayStr, 
                "fecha.fin": todayStr,
                "ip": "",
                "estado": ""
            };

            // 1. APLICAR FECHAS AL PAYLOAD (Corrección aquí)
            const dateInput = processDateInput(p_parameters.dateRange);
            if (dateInput) {
                payload["fecha.ini"] = dateInput.startStr;
                payload["fecha.fin"] = dateInput.endStr;
            }

            // Aplicar búsqueda
            if (p_parameters.search) {
                const term = p_parameters.search.trim();
                const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(term);
                if (isIp) {
                    payload.ip = term;
                } else {
                    payload.usuario = term;
                }
            }

            console.log('[API] Payload Search:', payload);
            response = await apiClient.post('/subroutine/OBTENER.CONEXIONES', payload);
        }

        let cleanData = dataMapper(p_option, response.data);

        // 2. APLICAR FILTRO DE FECHAS EN CLIENTE (Corrección aquí)
        // Usamos la misma lógica: si hay input de fecha, filtramos
        const dateFilter = processDateInput(p_parameters.dateRange);
        
        if (p_option === 'GET_HISTORY' && dateFilter) {
            const startDate = parseStrDate(dateFilter.startStr);
            const endDate = parseStrDate(dateFilter.endStr);

            if (startDate && endDate) {
                endDate.setHours(23, 59, 59, 999);
                startDate.setHours(0, 0, 0, 0);

                console.log(`[Client Filter] Filtrando: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);

                cleanData = cleanData.filter(item => {
                    const itemDate = parseStrDate(item.timestamp);
                    if (!itemDate) return false; 
                    return itemDate >= startDate && itemDate <= endDate;
                });
            }
        }

        return { data: cleanData };

    } catch (error) {
        console.error(`[API Error] Fallo en ${p_option}:`, error);
        return { data: [] };
    }
  },

  async patchUser(userApiId, u2version, updatePayload) {
    const url = `/Usuarios.registrados/${userApiId}`;
    const config = { headers: { 'If-Match': u2version } };
    const apiPayload = { observaciones: updatePayload.description };
    try {
        const response = await apiClient.patch(url, apiPayload, config);
        return response.data;
    } catch (error) { throw error; }
  }
};