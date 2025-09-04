import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://quvmonitor.qualitas.com:9191/UVAGTMON/subroutine/MN_SR_GT_MAIN',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default {
  getData(p_option, p_parameters = {}) {
    console.log(`Simulando llamada a la API con p_option: ${p_option}`);

    // --- SIMULACIÓN DE DATOS CENTRALIZADA ---

    if (p_option === 'GET_DASHBOARD') {
      return Promise.resolve({
        data: {
          kpis: { activeConnections: 12, uniqueUsers: 5, failedConnections: 2 },
          recentActivity: [
            { id: 1, user: 'user_app_01', ip: '192.168.1.10', status: 'Conectado' },
            { id: 2, user: 'user_db_03', ip: '10.0.0.5', status: 'Conectado' },
          ]
        }
      });
    }

    // AÑADIMOS EL CASO PARA OBTENER USUARIOS
if (p_option === 'GET_USERS') {
  const mockUsers = [ // <-- Guardamos los datos en una variable temporal
    { id: 1, username: 'user_app_01', owner: 'Juan Pérez', description: 'Aplicativo de Ventas', connectionLimit: 20, status: 'Activo' },
    { id: 2, username: 'user_db_03', owner: 'Equipo de BI', description: 'Base de Datos de Reportes', connectionLimit: 5, status: 'Activo' },
    { id: 3, username: 'user_batch', owner: 'Procesos Nocturnos', description: 'Ejecución de procesos batch', connectionLimit: 10, status: 'Inactivo' },
    { id: 4, username: 'api_connect', owner: 'Ana García', description: 'API Externa de Clientes', connectionLimit: 15, status: 'Activo' },
  ];

  // AÑADE ESTA LÍNEA
  console.log("apiService está a punto de devolver estos usuarios:", mockUsers);

  return Promise.resolve({ data: mockUsers });
}

    // AÑADIMOS EL CASO PARA OBTENER EL HISTORIAL
    if (p_option === 'GET_HISTORY') {
      return Promise.resolve({
        data: [
          { id: 1, user: 'user_app_01', ip: '192.168.1.10', timestamp: '2025-09-04 14:30:15', status: 'Exitoso' },
          { id: 2, user: 'root', ip: '201.150.3.45', timestamp: '2025-09-04 14:25:10', status: 'Fallido' },
          { id: 3, user: 'user_db_03', ip: '10.0.0.5', timestamp: '2025-09-04 14:22:05', status: 'Exitoso' },
        ]
      });
    }

    return Promise.resolve({ data: {} });
  }
};