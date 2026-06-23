import axios from 'axios';

const BASE_URL = '/api/UNIRPC_CONN';

const apiClient = axios.create({
baseURL: BASE_URL,
  timeout: 60000, // Tiempo de espera de 60 segundos
headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}
});

// --- INTERCEPTOR DE AUTENTICACIÓN (NUEVO) ---
apiClient.interceptors.request.use(config => {
    const auth = sessionStorage.getItem('app_authenticated');
    if (auth === 'true') {
        // Se añade la cabecera para que el backend reconozca la sesión
        config.headers.Authorization = `Bearer simulado_token`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- HELPERS DE FECHA ---

function formatDatePadded(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getToday() {
    return formatDatePadded(new Date());
}

function getDateMinusDays(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return formatDatePadded(d);
}

// --- MAPEO DE DATOS ---

function dataMapper(option, apiData) {
    if (!apiData) return [];
    if (typeof apiData === 'string') {
        try { apiData = JSON.parse(apiData); } catch (e) { return []; }
    }

    const usersList = apiData['Usuarios.registrados'] || (Array.isArray(apiData) ? apiData : null);
    
    if (usersList && (option === 'GET_USERS' || option === 'GET_DASHBOARD')) {
        return usersList.map((user, index) => ({
            id: index + 1,
            username: user._id,
            name: user.nombre_usuario || user._id,
            owner: user.propietario || 'N/A',
            description: user.observaciones || '',
            limit: user.umbral_maximo || '0', 
            status: user.activo === 'SI' ? 'Activo' : 'Inactivo',
            ip_address: Array.isArray(user.ip_autorizada) ? user.ip_autorizada.flat().join(', ') : (user.ip_autorizada || 'N/A'),
            u2version: user.u2version || null
        }));
    }

    if (option === 'GET_DASHBOARD_HISTORY') {
        return apiData.resultados || "";
    }

    if (apiData.resultados && option === 'GET_HISTORY') {
        let rawString = apiData.resultados;
        if (!rawString || rawString === "" || rawString === "SIN RESULTADOS") return [];
        const segments = rawString.split('ý');
        const result = [];
        let currentKey = '';
        for (const seg of segments) {
            const s = seg.trim();
            if (!s) continue;
            if (s.includes('ü')) {
                const parts = s.split('ü');
                result.push({
                    id: result.length + 1,
                    key: currentKey,
                    timestamp: parts[0] || 'N/A',
                    user: parts[1] || 'Desconocido',
                    ip: parts[2] || 'N/A',
                    status: parts[4] || 'Desconocido',
                    duration: parts[5] || 'N/A',
                    disconnectionReason: parts[6] || ''
                });
            } else {
                currentKey = s.includes('þ') ? s.split('þ').pop() : s;
            }
        }
        return result;
    }
    return [];
}

// --- PROCESAMIENTO PARA EL DASHBOARD CORREGIDO ---

function processDashboardData(users, historyRaw, daysRequested) {
    const dailyStats = {};
    const ipCounts = {};
    const today = new Date();

    const timeBlocks = typeof historyRaw === 'string' ? historyRaw.split('þ') : [];
    
    timeBlocks.forEach(block => {
        if (!block.trim()) return;

        const serverDayMatch = block.match(/^(\d{5})/);
        if (!serverDayMatch) return;
        
        const serverDayNum = serverDayMatch[1];
        const entries = block.split('ý');
        const userEntries = entries.filter(e => e.includes('ü'));

        const refDayNum = 21247;
        const refDate = new Date(2026, 2, 3); // 3 de Marzo de 2026
        const diffDays = parseInt(serverDayNum) - refDayNum;
        
        const actualDate = new Date(refDate);
        actualDate.setDate(refDate.getDate() + diffDays);
        const dateStr = formatDatePadded(actualDate);

        if (!dailyStats[dateStr]) {
            dailyStats[dateStr] = { totalConnections: 0, snapshotCount: 0 };
        }
        dailyStats[dateStr].totalConnections += userEntries.length;
        dailyStats[dateStr].snapshotCount += 1;

        userEntries.forEach(entry => {
            const parts = entry.split('ü');
            const ip = parts[2] ? parts[2].trim() : null;
            if (ip && ip !== 'N/A' && ip !== "") {
                ipCounts[ip] = (ipCounts[ip] || 0) + 1;
            }
        });
    });

    const labels = [];
    const chartData = [];
    for (let i = daysRequested - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayStr = formatDatePadded(d);
        
        labels.push(dayStr);
        const stats = dailyStats[dayStr];
        chartData.push(stats ? Math.round(stats.totalConnections / stats.snapshotCount) : 0);
    }

    const sortedIps = Object.entries(ipCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const activeConnections = (timeBlocks[0] || "").split('ý').filter(e => e.includes('ü')).length;

    const validValues = chartData.filter(v => v > 0);
    const globalAverage = validValues.length > 0 
        ? Math.round(validValues.reduce((a, b) => a + b, 0) / validValues.length) 
        : 0;

    return {
        kpis: {
            totalUsers: users.length,
            activeConnections,
            alerts: globalAverage
        },
        charts: {
            trends: { labels, data: chartData },
            topIps: { 
                labels: sortedIps.map(i => i[0]), 
                data: sortedIps.map(i => i[1]) 
            }
        }
    };
}

export default {
async getPusers() {
    const response = await apiClient.get('/Pusers');
    const d = response.data;
    return Array.isArray(d) ? d : (Array.isArray(d?.Pusers) ? d.Pusers : []);
},

async adminPusers(opcion, payload) {
    const response = await apiClient.post('/subroutine/ADMIN.PUSERS', {
        'OPCION': String(opcion),
        'ADM.USR': payload.admUsr,
        'USUARIO': payload.usuario,
        'NOMBRE':  payload.nombre  || '',
        'CLAVE':   payload.clave   || '',
        'ROL':     payload.rol     || '',
        'ACTIVO':  payload.activo  || '1'
    });
    return response.data;
},

async getConfigReportes() {
    const response = await apiClient.get('/Config.reportes');
    const d = response.data;
    return Array.isArray(d) ? d : (Array.isArray(d?.['Config.reportes']) ? d['Config.reportes'] : []);
},

async getServiciosRegistrados() {
    const response = await apiClient.get('/Servicios.registrados');
    const d = response.data;
    return Array.isArray(d) ? d : (Array.isArray(d?.['Servicios.registrados']) ? d['Servicios.registrados'] : []);
},

async login(user, pass) {
    const response = await apiClient.post('/subroutine/SLOGIN', { USER: user, PASS: pass });
    const output = response.data?.OUTPUT;
    if (!output || isNaN(Number(output))) {
        throw new Error(output || 'Error de autenticación');
    }
    return response.data;
},

async logout(user) {
    const response = await apiClient.post('/subroutine/SLOGOUT', { USER: user });
    return response.data;
},

async changePassword(user, id, pass) {
    const response = await apiClient.post('/subroutine/CHANGE.PASS', { USER: user, ID: id, PASS: pass });
    return response.data;
},

async getData(p_option, p_parameters = {}) {
    try {
        if (p_option === 'SAVE_USER') {
            const mappedParams = {
                "usuario": p_parameters.usuario || "",
                "propietario": p_parameters.propietario || "",
                "descripcion": p_parameters.descripcion || "",
                "limite": String(p_parameters.limite || "")
            };
            let response = await apiClient.post('/subroutine/GUARDAR.DATOS.USUARIO', mappedParams);
            return { data: response.data };
        }

        if (p_option === 'GET_HISTORY') {
            const mappedParams = {
                "usuario": p_parameters.search || "", 
                "fecha.ini": p_parameters.startDate || "", 
                "fecha.fin": p_parameters.endDate || "", 
                "ip": "", 
                "estado": ""
            };
            let response = await apiClient.post('/subroutine/OBTENER.CONEXIONES', mappedParams);
            return { data: dataMapper(p_option, response.data) };
        }

        if (p_option === 'GET_DASHBOARD') {
            const days = p_parameters.days || 15;
            const fechaFin = getToday();
            const fechaIni = getDateMinusDays(days);

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
            const historyRawString = dataMapper('GET_DASHBOARD_HISTORY', historyRaw);
            
            return { data: processDashboardData(usersClean, historyRawString, days) };
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