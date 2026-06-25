<template>
  <div class="settings-page" @click="closeExportMenu">
    <header class="settings-header">
      <h1>Historial de Conexiones</h1>
      <p>Registro histórico de todos los intentos de conexión al servidor.</p>
    </header>

    <main class="settings-content">
      <section class="card mb-4 shadow-sm">
        <div class="card-header">
          <div class="icon-circle">
            <i class="search-icon">🔍</i>
          </div>
          <h2>Filtrar Resultados</h2>
        </div>
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar por Usuario o IP..."
            class="styled-input"
            @keyup.enter="fetchHistory"
          >
          <div class="date-input-wrapper">
            <input
              type="text"
              v-model="singleDate"
              placeholder="Fecha (DD/MM/YYYY)"
              class="styled-input"
              @change="fetchHistory"
            >
          </div>
          <button @click="fetchHistory" class="btn-verify" :disabled="loading">
            {{ loading ? 'Cargando...' : 'Aplicar Filtros' }}
          </button>
        </div>
      </section>

      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4 d-flex justify-content-between align-items-center">
          <h3>Registros de Acceso</h3>
          <div class="header-right">
            <span class="records-count">{{ filteredConnections.length }} resultados</span>
            <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
            <div class="export-wrapper" @click.stop>
              <button ref="exportBtn" class="btn-export" :disabled="filteredConnections.length === 0" @click="toggleExportMenu">
                ⬇ Exportar <span class="arrow">▾</span>
              </button>
            </div>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="showExportMenu" class="export-dropdown-portal" :style="exportDropdownStyle" @click.stop>
            <button class="export-option" @click="exportPDF">
              <span class="opt-icon">📄</span>
              <span class="opt-label"><strong>PDF</strong><small>Tabla formateada lista para imprimir</small></span>
            </button>
            <button class="export-option" @click="exportCSV">
              <span class="opt-icon">📊</span>
              <span class="opt-label"><strong>CSV</strong><small>Compatible con Excel y Google Sheets</small></span>
            </button>
            <button class="export-option" @click="exportTXT">
              <span class="opt-icon">📝</span>
              <span class="opt-label"><strong>TXT</strong><small>Tabla de texto con formato legible</small></span>
            </button>
          </div>
        </Teleport>

        <div v-if="loading" class="p-4 text-center text-muted">Cargando registros...</div>
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th @click="sortBy('key')" class="sortable-header">
                  Llave <span :class="['sort-icon', sortField !== 'key' ? 'neutral' : '']">{{ sortIcon('key') }}</span>
                </th>
                <th @click="sortBy('user')" class="sortable-header">
                  Usuario <span :class="['sort-icon', sortField !== 'user' ? 'neutral' : '']">{{ sortIcon('user') }}</span>
                </th>
                <th @click="sortBy('ip')" class="sortable-header">
                  IP de Origen <span :class="['sort-icon', sortField !== 'ip' ? 'neutral' : '']">{{ sortIcon('ip') }}</span>
                </th>
                <th @click="sortBy('timestamp')" class="sortable-header">
                  Fecha y Hora <span :class="['sort-icon', sortField !== 'timestamp' ? 'neutral' : '']">{{ sortIcon('timestamp') }}</span>
                </th>
                <th @click="sortBy('status')" class="sortable-header">
                  Resultado <span :class="['sort-icon', sortField !== 'status' ? 'neutral' : '']">{{ sortIcon('status') }}</span>
                </th>
                <th>Duración</th>
                <th>Motivo de desconexión</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedConnections.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">No se encontraron registros</td>
              </tr>
              <tr v-for="conn in paginatedConnections" :key="conn.id">
                <td class="text-mono key-cell">{{ conn.key || '—' }}</td>
                <td class="font-weight-bold text-dark">{{ conn.user }}</td>
                <td class="text-mono">{{ conn.ip }}</td>
                <td>
                  <span class="date-clickable" @click="filterByDate(conn.timestamp)" title="Filtrar por esta fecha">
                    {{ conn.timestamp }}
                    <span class="date-filter-icon">📅</span>
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(conn.status)">{{ conn.status }}</span>
                </td>
                <td>{{ conn.duration || 'N/A' }}</td>
                <td>{{ conn.disconnectionReason || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && totalPages > 1" class="pagination">
          <button @click="currentPage = 1" :disabled="currentPage === 1" class="page-btn">«</button>
          <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">‹</button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="currentPage = p"
            :class="['page-btn', p === currentPage ? 'active' : '']"
          >{{ p }}</button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">›</button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="page-btn">»</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import apiService from '../apiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CACHE_KEY = 'history_cache';
const REFRESH_MS = 5 * 60 * 1000;
const EXP_COLS = ['Llave', 'Usuario', 'IP de Origen', 'Fecha y Hora', 'Resultado', 'Duración', 'Motivo'];
const TODAY_STR = () => new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
const FILENAME = (ext) => `historial_conexiones_${new Date().toISOString().slice(0,10)}.${ext}`;

export default {
  name: 'ConnectionHistory',
  data() {
    return {
      connections: [],
      searchQuery: '',
      singleDate: '',
      loading: false,
      sortField: null,
      sortDir: 'asc',
      currentPage: 1,
      pageSize: 50,
      showExportMenu: false,
      exportDropdownStyle: {}
    };
  },
  computed: {
    sortedConnections() {
      if (!this.sortField) return this.connections;
      const field = this.sortField;
      const dir = this.sortDir === 'asc' ? 1 : -1;
      return [...this.connections].sort((a, b) => {
        const va = (a[field] || '').toLowerCase();
        const vb = (b[field] || '').toLowerCase();
        return va.localeCompare(vb, undefined, { numeric: true }) * dir;
      });
    },
    filteredConnections() {
      if (!this.singleDate) return this.sortedConnections;
      const [fd, fm, fy] = this.singleDate.split('/');
      return this.sortedConnections.filter(conn => {
        if (!conn.timestamp) return false;
        const [d, m, y] = conn.timestamp.split(' ')[0].split('/');
        return parseInt(d) === parseInt(fd) && m === fm && y === fy;
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredConnections.length / this.pageSize));
    },
    paginatedConnections() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredConnections.slice(start, start + this.pageSize);
    },
    visiblePages() {
      const total = this.totalPages;
      const cur = this.currentPage;
      const delta = 2;
      const pages = [];
      for (let p = Math.max(1, cur - delta); p <= Math.min(total, cur + delta); p++) {
        pages.push(p);
      }
      return pages;
    }
  },
  watch: {
    filteredConnections() {
      this.currentPage = 1;
    }
  },
  mounted() {
    this._isMounted = true;
    const cached = this.getCachedData();
    if (cached) {
      this.connections = cached;
    } else {
      this.loading = true;
    }
    this.loadFreshData();
    this._refreshInterval = setInterval(() => this.loadFreshData(), REFRESH_MS);
  },
  beforeUnmount() {
    this._isMounted = false;
    clearInterval(this._refreshInterval);
  },
  methods: {
    getCachedData() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw).data ?? null;
      } catch { return null; }
    },
    setCachedData(data) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch { /* quota exceeded */ }
    },

    expRows() {
      return this.filteredConnections.map(c => [
        c.key || '', c.user || '', c.ip || '', c.timestamp || '',
        c.status || '', c.duration || '', c.disconnectionReason || ''
      ]);
    },
    toggleExportMenu() {
      if (!this.showExportMenu) {
        const rect = this.$refs.exportBtn.getBoundingClientRect();
        this.exportDropdownStyle = { position: 'fixed', top: (rect.bottom + 6) + 'px', right: (window.innerWidth - rect.right) + 'px', zIndex: 9999 };
      }
      this.showExportMenu = !this.showExportMenu;
    },
    closeExportMenu() { this.showExportMenu = false; },
    dlBlob(content, filename, mime) {
      const url = URL.createObjectURL(new Blob([content], { type: mime }));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url); this.showExportMenu = false;
    },
    exportPDF() {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      doc.setFillColor(66, 153, 225); doc.rect(0, 0, 297, 22, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
      doc.text('Gestión RPC — Historial de Conexiones', 14, 14);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(TODAY_STR(), 283, 14, { align: 'right' });
      doc.setFillColor(235, 248, 255); doc.rect(0, 22, 297, 8, 'F');
      doc.setTextColor(45, 55, 72); doc.setFontSize(8);
      doc.text(`Registros mostrados: ${this.filteredConnections.length}`, 14, 27.5);
      autoTable(doc, {
        startY: 32, head: [EXP_COLS], body: this.expRows(),
        styles: { fontSize: 8, cellPadding: 3, lineColor: [237,242,247], lineWidth: 0.3, textColor: [45,55,72] },
        headStyles: { fillColor: [26,32,44], textColor: [255,255,255], fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [247,250,252] },
        didDrawPage: (d) => {
          doc.setFontSize(7); doc.setTextColor(160,174,192);
          doc.text(`Página ${d.pageNumber} de ${doc.internal.getNumberOfPages()}`, d.settings.margin.left, doc.internal.pageSize.height - 5);
          doc.text('Gestión RPC', 283, doc.internal.pageSize.height - 5, { align: 'right' });
        }
      });
      doc.save(FILENAME('pdf')); this.showExportMenu = false;
    },
    exportCSV() {
      const esc = v => { const s = String(v ?? '').replace(/"/g, '""'); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s; };
      const lines = [`# Gestión RPC — Historial de Conexiones`, `# Generado: ${TODAY_STR()}`, `# Registros: ${this.filteredConnections.length}`, '', EXP_COLS.join(','), ...this.expRows().map(r => r.map(esc).join(','))];
      this.dlBlob('﻿' + lines.join('\r\n'), FILENAME('csv'), 'text/csv;charset=utf-8;');
    },
    exportTXT() {
      const rows = this.expRows();
      const widths = EXP_COLS.map((c, i) => Math.max(c.length, ...rows.map(r => String(r[i] ?? '').length)));
      const pad = (s, l) => String(s ?? '').padEnd(l);
      const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
      const lines = [
        '='.repeat(sep.length), `  GESTIÓN RPC — HISTORIAL DE CONEXIONES`, `  Generado: ${TODAY_STR()}`, `  Registros: ${this.filteredConnections.length}`, '='.repeat(sep.length), '',
        sep, '| ' + EXP_COLS.map((c, i) => pad(c, widths[i])).join(' | ') + ' |', sep.replace(/-/g, '='),
        ...rows.flatMap(r => ['| ' + r.map((c, i) => pad(c, widths[i])).join(' | ') + ' |', sep]),
        '', 'Fin del reporte.'
      ];
      this.dlBlob(lines.join('\r\n'), FILENAME('txt'), 'text/plain;charset=utf-8;');
    },

    defaultDateRange() {
      const pad = n => String(n).padStart(2, '0');
      const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const today = new Date();
      const from = new Date(today);
      from.setDate(from.getDate() - 15);
      return { start: fmt(from), end: fmt(today) };
    },

    async loadFreshData() {
      try {
        const { start, end } = this.defaultDateRange();
        const response = await apiService.getData('GET_HISTORY', { search: '', startDate: start, endDate: end });
        if (!this._isMounted) return;
        this.connections = response.data;
        this.setCachedData(response.data);
      } catch (error) {
        console.error('Error al refrescar el historial:', error);
      } finally {
        if (this._isMounted) this.loading = false;
      }
    },

    async fetchHistory() {
      const isDefaultQuery = !this.searchQuery && !this.singleDate;
      if (isDefaultQuery) {
        await this.loadFreshData();
        return;
      }
      this.loading = true;
      try {
        const { start, end } = this.defaultDateRange();
        const params = {
          search: this.searchQuery,
          startDate: this.singleDate || start,
          endDate: this.singleDate || end
        };
        const response = await apiService.getData('GET_HISTORY', params);
        if (!this._isMounted) return;
        this.connections = response.data;
        this.currentPage = 1;
      } catch (error) {
        console.error('Error al obtener el historial:', error);
      } finally {
        if (this._isMounted) this.loading = false;
      }
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDir = 'asc';
      }
      this.currentPage = 1;
    },

    sortIcon(field) {
      if (this.sortField !== field) return '⇵';
      return this.sortDir === 'asc' ? '▲' : '▼';
    },

    filterByDate(timestamp) {
      if (!timestamp) return;
      const datePart = timestamp.split(' ')[0];
      const [day, month, year] = datePart.split('/');
      this.singleDate = `${day.padStart(2, '0')}/${month}/${year}`;
      this.fetchHistory();
    },

    getStatusClass(status) {
      if (!status) return 'status-badge';
      const s = status.toString().toUpperCase();
      return (s === 'EXITOSO' || s === 'CONECTADO' || s === 'SI')
        ? 'status-badge success'
        : 'status-badge error';
    }
  }
};
</script>

<style scoped>
.settings-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', -apple-system, sans-serif; color: #2d3748; }
.settings-header { margin-bottom: 30px; text-align: center; }
.settings-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.settings-header p { color: #718096; }
.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); border: 1px solid #edf2f7; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.card-header h2 { font-size: 1.1rem; font-weight: 600; margin: 0; }
.icon-circle { width: 36px; height: 36px; background: #ebf8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.search-box { display: flex; gap: 12px; align-items: center; }
.styled-input { flex: 1; padding: 12px 16px; border: 2px solid #edf2f7; border-radius: 8px; font-size: 1rem; transition: all .2s; box-sizing: border-box; }
.styled-input:focus { outline: none; border-color: #4299e1; }
.date-input-wrapper { max-width: 220px; }
.btn-verify { background: #4299e1; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s; }
.btn-verify:hover:not(:disabled) { background: #3182ce; }
.btn-verify:active:not(:disabled) { background: #2b6cb0; }
.btn-verify:disabled { opacity: .6; cursor: not-allowed; }
.header-right { display: flex; align-items: center; gap: 12px; }
.records-count { background: #f7fafc; padding: 4px 12px; border-radius: 20px; font-size: .85rem; color: #718096; font-weight: 500; }
.page-info { font-size: .85rem; color: #718096; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f7fafc; padding: 12px 15px; text-align: left; font-size: .85rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: .025em; }
.custom-table td { padding: 12px 15px; border-bottom: 1px solid #edf2f7; font-size: .9rem; }
.sortable-header { cursor: pointer; user-select: none; }
.sortable-header:hover { color: #4299e1; }
.sort-icon { margin-left: 4px; font-size: .75rem; }
.sort-icon.neutral { color: #cbd5e0; }
.text-mono { font-family: 'Courier New', Courier, monospace; font-weight: 600; }
.key-cell { font-size: .78rem; color: #718096; max-width: 160px; word-break: break-all; }
.status-badge { padding: 3px 9px; border-radius: 6px; font-size: .8rem; font-weight: 600; display: inline-block; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }
.date-clickable { cursor: pointer; border-radius: 4px; padding: 2px 4px; transition: background .15s; display: inline-flex; align-items: center; gap: 5px; }
.date-clickable:hover { background: #ebf8ff; color: #2b6cb0; }
.date-filter-icon { font-size: .8rem; opacity: 0; transition: opacity .15s; }
.date-clickable:hover .date-filter-icon { opacity: 1; }
.table-responsive { width: 100%; overflow-x: auto; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 4px; padding: 16px; border-top: 1px solid #edf2f7; }
.page-btn { background: #f7fafc; border: 1px solid #e2e8f0; color: #4a5568; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: .9rem; transition: all .15s; min-width: 36px; }
.page-btn:hover:not(:disabled) { background: #ebf8ff; border-color: #4299e1; color: #2b6cb0; }
.page-btn.active { background: #4299e1; border-color: #4299e1; color: white; font-weight: 700; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.mb-4 { margin-bottom: 24px; }
.p-0 { padding: 0; }
.p-4 { padding: 1rem; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.overflow-hidden { overflow: hidden; }
.text-center { text-align: center; }
.text-muted { color: #718096; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.font-weight-bold { font-weight: 600; }
.btn-export { background: #4299e1; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: .85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background .15s; white-space: nowrap; }
.btn-export:hover:not(:disabled) { background: #3182ce; }
.btn-export:disabled { opacity: .4; cursor: not-allowed; }
.arrow { font-size: .7rem; }
.export-wrapper { position: relative; }
@media (max-width: 768px) {
  .search-box { flex-direction: column; align-items: stretch; }
  .date-input-wrapper { max-width: 100%; }
}
</style>

<style>
.export-dropdown-portal { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.15); min-width: 240px; }
.export-dropdown-portal .export-option { display: flex; align-items: center; gap: 12px; width: 100%; padding: 13px 16px; background: none; border: none; border-bottom: 1px solid #f0f4f8; cursor: pointer; text-align: left; transition: background .12s; box-sizing: border-box; }
.export-dropdown-portal .export-option:first-child { border-radius: 10px 10px 0 0; }
.export-dropdown-portal .export-option:last-child { border-bottom: none; border-radius: 0 0 10px 10px; }
.export-dropdown-portal .export-option:hover { background: #ebf8ff; }
.export-dropdown-portal .opt-icon { font-size: 1.3rem; flex-shrink: 0; }
.export-dropdown-portal .opt-label { display: flex; flex-direction: column; }
.export-dropdown-portal .opt-label strong { font-size: .9rem; color: #1a202c; }
.export-dropdown-portal .opt-label small { font-size: .75rem; color: #718096; margin-top: 2px; }
</style>
