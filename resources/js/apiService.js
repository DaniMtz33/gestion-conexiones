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

function dataMapper(option, apiData) {
    // 1. Validación de entrada
    if (!apiData) return [];

    if (typeof apiData === 'string') {
        try { 
            apiData = JSON.parse(apiData); 
        } catch (e) { 
            console.error("Error parseando JSON:", e);
            return []; 
        }
    }

    // 2. Identificar el contenido del payload
    // ¿Es un payload de usuarios? (Tiene la clave o es un array)
    const hasUserKey = Object.prototype.hasOwnProperty.call(apiData, 'Usuarios.registrados');
    const isUserArray = Array.isArray(apiData);
    
    // ¿Es un payload de historial? (Tiene la clave resultados)
    const isHistoryPayload = apiData && typeof apiData.resultados === 'string';

    // 3. PROCESAMIENTO DE USUARIOS
    // Solo entramos aquí si el payload realmente contiene usuarios
    if ((hasUserKey || isUserArray) && (option === 'GET_USERS' || option === 'GET_DASHBOARD')) {
        const users = apiData['Usuarios.registrados'] || (isUserArray ? apiData : []);
        
        // Si no hay usuarios en un payload que debería tenerlos, devolvemos lo que hay para no romper la cadena
        if (users.length === 0 && option === 'GET_USERS') return [];

        return users.map((user, index) => {
            // Manejo de IP: Aplanamos el array [[ "ip" ]] que devuelve UniVerse
            let ip = 'N/A';
            if (Array.isArray(user.ip_autorizada)) {
                ip = user.ip_autorizada.flat().join(', ');
            } else if (user.ip_autorizada) {
                ip = user.ip_autorizada;
            }

            return {
                id: index + 1,
                username: user._id || `user_${index}`,
                name: user.nombre_usuario || user._id,
                owner: user.propietario || 'N/A',
                description: user.observaciones || '',
                status: user.activo === 'SI' ? 'Activo' : 'Inactivo',
                api_id: user._id,
                ip_address: ip,
                u2version: user.u2version || null
            };
        });
    }

    // 4. PROCESAMIENTO DE HISTORIAL
    // Solo entramos aquí si el payload realmente contiene resultados de historial
    if (isHistoryPayload && (option === 'GET_HISTORY' || option === 'GET_DASHBOARD')) {
        let rawString = apiData.resultados;
        if (rawString === "" || rawString === "SIN RESULTADOS") return [];
        
        // ý separa registros, ü separa campos
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

    // 5. Fallback
    return [];
}

function processDashboardData(users, history) {
    const totalUsers = users.length;

    // 1. Conexiones Activas (Contamos registros 'EXITOSO')
    const activeConnections = history.filter(h => 
        h.status && h.status.toLowerCase().includes('exitoso')
    ).length;

    // 2. Media Diaria (Mes actual día por día)
    const today = new Date();
    const daysInMonth = today.getDate();
    const trendsMap = {};
    const labels = [];
    
    for(let i = 1; i <= daysInMonth; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i);
        const dayStr = formatDate(d);
        trendsMap[dayStr] = 0;
        labels.push(dayStr);
    }

    let totalConnectionsThisMonth = 0;
    history.forEach(h => {
        let datePart = h.timestamp ? h.timestamp.split(' ')[0] : "";
        // Normalización de fecha (5/02/2026 -> 05/02/2026)
        if (datePart && datePart.includes('/')) {
            const dp = datePart.split('/');
            if (dp[0].length === 1) dp[0] = '0' + dp[0];
            if (dp[1].length === 1) dp[1] = '0' + dp[1];
            datePart = dp.join('/');
        }
        if (datePart && trendsMap.hasOwnProperty(datePart)) {
            trendsMap[datePart]++;
            totalConnectionsThisMonth++;
        }
    });

    const dailyAverage = daysInMonth > 0 ? (totalConnectionsThisMonth / daysInMonth).toFixed(2) : 0;

    // 3. Top IPs (Mayor a menor uso)
    const ipMap = {};
    history.forEach(h => {
        const ip = h.ip && h.ip !== 'N/A' ? h.ip.trim() : null;
        if (ip) ipMap[ip] = (ipMap[ip] || 0) + 1;
    });

    const sortedIps = Object.entries(ipMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        kpis: {
            totalUsers,
            activeConnections,
            alerts: dailyAverage // Media diaria
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
      if (p_option === 'GET_DASHBOARD') {
        // Usamos allSettled: si una falla, la otra sigue viva
        const results = await Promise.allSettled([
          apiClient.get('/Usuarios.registrados'),
          apiClient.post('/subroutine/OBTENER.CONEXIONES', {
            "usuario": "", "fecha.ini": "", "fecha.fin": "", "ip": "", "estado": ""
          })
        ]);

        // Extraemos los datos solo si la promesa tuvo éxito
        const usersRaw = results[0].status === 'fulfilled' ? results[0].value.data : {};
        const historyRaw = results[1].status === 'fulfilled' ? results[1].value.data : { resultados: "" };

        // Mapeamos de forma independiente
        const usersClean = dataMapper('GET_USERS', usersRaw);
        const historyClean = dataMapper('GET_HISTORY', historyRaw);
        
        // totalUsers será usersClean.length (DINÁMICO)
        return { data: processDashboardData(usersClean, historyClean) };
      }

      // ... resto de la lógica para otras pantallas
      let response = await (p_option === 'GET_USERS' 
        ? apiClient.get('/Usuarios.registrados') 
        : apiClient.post('/subroutine/OBTENER.CONEXIONES', p_parameters));

      return { data: dataMapper(p_option, response.data) };

    } catch (error) {
      console.error(`[API Error]`, error);
      // Retornamos estructura básica para que el Dashboard no se rompa
      if (p_option === 'GET_DASHBOARD') {
        return { data: { kpis: { totalUsers: 0, activeConnections: 0, alerts: 0 }, charts: { trends: {labels:[], data:[]}, topIps: {labels:[], data:[]} } } };
      }
      return { data: [] };
    }
  }
};