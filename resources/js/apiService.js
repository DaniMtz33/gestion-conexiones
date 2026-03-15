import axios from 'axios';

const BASE_URL = '/api/UNIRPC_CONN';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- HELPERS DE FECHA ---

function formatDatePadded(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Obtiene la fecha de hoy
function getToday() {
    return formatDatePadded(new Date());
}

// Obtiene la fecha de hace exactamente un mes
function getLastMonthDate() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return formatDatePadded(d);
}

// --- MAPEO DE DATOS ---

function dataMapper(option, apiData) {
    if (!apiData) return [];
    if (typeof apiData === 'string') {
        try { apiData = JSON.parse(apiData); } catch (e) { return []; }
    }

    const usersList = apiData['Usuarios.registrados'] || (Array.isArray(apiData) ? apiData : null);
    const isHistoryPayload = apiData && typeof apiData.resultados === 'string';

    if (usersList && (option === 'GET_USERS' || option === 'GET_DASHBOARD')) {
        return usersList.map((user, index) => ({
            id: index + 1,
            username: user._id,
            name: user.nombre_usuario || user._id,
            owner: user.propietario || 'N/A',
            description: user.observaciones || '',
            status: user.activo === 'SI' ? 'Activo' : 'Inactivo',
            ip_address: Array.isArray(user.ip_autorizada) ? user.ip_autorizada.flat().join(', ') : (user.ip_autorizada || 'N/A'),
            u2version: user.u2version || null
        }));
    }

    if (isHistoryPayload && (option === 'GET_HISTORY' || option === 'GET_DASHBOARD')) {
        let rawString = apiData.resultados;
        if (!rawString || rawString === "" || rawString === "SIN RESULTADOS") return [];
        const rows = rawString.split('ý'); 
        return rows.filter(r => r.includes('ü')).map((row, index) => {
            const parts = row.split('ü'); 
            return {
                id: index + 1,
                timestamp: parts[0] || 'N/A',
                user: parts[1] || 'Desconocido',
                ip: parts[2] || 'N/A',
                status: parts[4] || 'Desconocido',
                duration: parts[5] || 'N/A'
            };
        });
    }
    return [];
}

// --- PROCESAMIENTO PARA EL DASHBOARD ---

function processDashboardData(users, history) {
    const totalUsers = users.length;
    
    const activeConnections = history.filter(h => 
        h.status && h.status.toUpperCase().includes('EXITOSO')
    ).length;

    const labels = [];
    const trendsMap = {};
    const today = new Date();

    // Generar etiquetas para los últimos 30 días (Rango móvil)
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayStr = formatDatePadded(d);
        labels.push(dayStr);
        trendsMap[dayStr] = 0;
    }

    let totalInRange = 0;
    history.forEach(h => {
        let datePart = h.timestamp ? h.timestamp.split(' ')[0] : "";
        if (datePart && datePart.includes('/')) {
            const dp = datePart.split('/');
            const norm = `${dp[0].padStart(2, '0')}/${dp[1].padStart(2, '0')}/${dp[2]}`;
            if (Object.prototype.hasOwnProperty.call(trendsMap, norm)) {
                trendsMap[norm]++;
                totalInRange++;
            }
        }
    });

    const ipMap = {};
    history.forEach(h => {
        if (h.ip && h.ip !== 'N/A') {
            const ip = h.ip.trim();
            ipMap[ip] = (ipMap[ip] || 0) + 1;
        }
    });

    const sortedIps = Object.entries(ipMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
        kpis: {
            totalUsers,
            activeConnections,
            alerts: (totalInRange / 30).toFixed(2) // Media diaria sobre 30 días
        },
        charts: {
            trends: { labels, data: labels.map(l => trendsMap[l]) },
            topIps: {
                labels: sortedIps.map(i => i[0]),
                data: sortedIps.map(i => i[1])
            }
        }
    };
}

export default {
  async getData(p_option, p_parameters = {}) {
    try {
        if (p_option === 'GET_HISTORY') {
            const mappedParams = {
                "usuario": p_parameters.search || "", 
                "fecha.ini": p_parameters.startDate || "", 
                "fecha.fin": p_parameters.endDate || "", // Ahora enviamos el fin del rango
                "ip": "", 
                "estado": ""
            };

            let response = await apiClient.post('/subroutine/OBTENER.CONEXIONES', mappedParams);
            return { data: dataMapper(p_option, response.data) };
        }

        if (p_option === 'GET_DASHBOARD') {
            // Definimos el rango de un mes para la API
            const fechaFin = getToday();
            const fechaIni = getLastMonthDate();

            const results = await Promise.allSettled([
                apiClient.get('/Usuarios.registrados'),
                apiClient.post('/subroutine/OBTENER.CONEXIONES', {
                    "usuario": "", 
                    "fecha.ini": fechaIni, 
                    "fecha.fin": fechaFin, 
                    "ip": "", 
                    "estado": ""
                })
            ]);

            const usersRaw = results[0].status === 'fulfilled' ? results[0].value.data : {};
            const historyRaw = results[1].status === 'fulfilled' ? results[1].value.data : { resultados: "" };

            const usersClean = dataMapper('GET_USERS', usersRaw);
            const historyClean = dataMapper('GET_HISTORY', historyRaw);
            
            return { data: processDashboardData(usersClean, historyClean) };
        }

        const isUsers = p_option === 'GET_USERS';
        const response = await (isUsers 
            ? apiClient.get('/Usuarios.registrados') 
            : apiClient.post('/subroutine/OBTENER.CONEXIONES', p_parameters));

        return { data: dataMapper(p_option, response.data) };

    } catch (error) {
        console.error(`[API Error] Fallo en ${p_option}:`, error);
        if (p_option === 'GET_DASHBOARD') {
            return { 
                data: { 
                    kpis: { totalUsers: 0, activeConnections: 0, alerts: 0 }, 
                    charts: { trends: {labels:[], data:[]}, topIps: {labels:[], data:[]} } 
                } 
            };
        }
        return { data: [] };
    }
  }
};