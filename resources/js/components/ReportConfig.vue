<template>
  <div class="settings-page" @click="closeExportMenu">
    <header class="settings-header">
      <h1>Configuración de Reportes</h1>
      <p>Gestión de reportes automáticos y sus destinatarios.</p>
    </header>

    <main class="settings-content">
      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4">
          <div class="icon-circle"><i>📋</i></div>
          <h3>Reportes Configurados</h3>
          <span class="records-count">{{ reportes.length }} registros</span>

          <div class="export-wrapper" @click.stop>
            <button
              ref="exportBtn"
              class="btn-export"
              :disabled="reportes.length === 0"
              @click="toggleExportMenu"
            >
              ⬇ Exportar <span class="arrow">▾</span>
            </button>
          </div>

          <Teleport to="body">
            <div v-if="showExportMenu" class="export-dropdown-portal" :style="dropdownStyle" @click.stop>
              <button class="export-option" @click="exportPDF">
                <span class="opt-icon">📄</span>
                <span class="opt-label">
                  <strong>PDF</strong>
                  <small>Tabla formateada lista para imprimir</small>
                </span>
              </button>
              <button class="export-option" @click="exportCSV">
                <span class="opt-icon">📊</span>
                <span class="opt-label">
                  <strong>CSV</strong>
                  <small>Compatible con Excel y Google Sheets</small>
                </span>
              </button>
              <button class="export-option" @click="exportTXT">
                <span class="opt-icon">📝</span>
                <span class="opt-label">
                  <strong>TXT</strong>
                  <small>Tabla de texto con formato legible</small>
                </span>
              </button>
            </div>
          </Teleport>
        </div>

        <div v-if="loading" class="p-4 text-center text-muted">Cargando reportes...</div>
        <div v-else-if="error" class="p-4 text-center" style="color:#c53030;">{{ error }}</div>
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Frecuencia</th>
                <th>Formato</th>
                <th>Destinatarios</th>
                <th>Servicios Asociados</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportes.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">No se encontraron reportes configurados</td>
              </tr>
              <tr v-for="r in reportes" :key="r._id">
                <td class="font-weight-bold">{{ r._id }}</td>
                <td>{{ r.frecuencia || '—' }}</td>
                <td>{{ r.formato || '—' }}</td>
                <td>{{ formatDestinatarios(r.destinatarios) }}</td>
                <td>{{ r.servicios_asociados || '—' }}</td>
                <td>
                  <span :class="['status-badge', r.activo === '1' ? 'success' : 'error']">
                    {{ r.activo === '1' ? 'SI' : 'NO' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import apiService from '../apiService.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLUMNS = ['ID', 'Frecuencia', 'Formato', 'Destinatarios', 'Servicios Asociados', 'Activo'];
const TODAY = () => new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
const FILENAME = (ext) => `config_reportes_${new Date().toISOString().slice(0, 10)}.${ext}`;

export default {
  name: 'ReportConfig',
  data() {
    return { reportes: [], loading: false, error: '', showExportMenu: false, dropdownStyle: {} };
  },
  mounted() {
    this.loadReportes();
  },
  methods: {
    async loadReportes() {
      this.loading = true;
      this.error = '';
      try {
        this.reportes = await apiService.getConfigReportes();
      } catch {
        this.error = 'No se pudo cargar la configuración de reportes.';
      } finally {
        this.loading = false;
      }
    },

    formatDestinatarios(dest) {
      if (!dest) return '—';
      if (Array.isArray(dest)) return dest.flat().filter(Boolean).join(', ') || '—';
      return dest;
    },

    rowData() {
      return this.reportes.map(r => [
        r._id || '',
        r.frecuencia || '',
        r.formato || '',
        this.formatDestinatarios(r.destinatarios),
        r.servicios_asociados || '',
        r.activo === '1' ? 'SI' : 'NO'
      ]);
    },

    toggleExportMenu() {
      if (!this.showExportMenu) {
        const rect = this.$refs.exportBtn.getBoundingClientRect();
        this.dropdownStyle = {
          position: 'fixed',
          top: (rect.bottom + 6) + 'px',
          right: (window.innerWidth - rect.right) + 'px',
          zIndex: 9999
        };
      }
      this.showExportMenu = !this.showExportMenu;
    },
    closeExportMenu() { this.showExportMenu = false; },

    download(content, filename, mime) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      this.showExportMenu = false;
    },

    exportPDF() {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header band
      doc.setFillColor(66, 153, 225);
      doc.rect(0, 0, 297, 22, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Gestión RPC — Configuración de Reportes', 14, 14);

      // Date top-right
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(TODAY(), 283, 14, { align: 'right' });

      // Subtitle bar
      doc.setFillColor(235, 248, 255);
      doc.rect(0, 22, 297, 8, 'F');
      doc.setTextColor(45, 55, 72);
      doc.setFontSize(8);
      doc.text(`Total de registros: ${this.reportes.length}`, 14, 27.5);

      autoTable(doc, {
        startY: 32,
        head: [COLUMNS],
        body: this.rowData(),
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [237, 242, 247],
          lineWidth: 0.3,
          textColor: [45, 55, 72]
        },
        headStyles: {
          fillColor: [26, 32, 44],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left'
        },
        alternateRowStyles: { fillColor: [247, 250, 252] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 30 },
          5: { halign: 'center', cellWidth: 18 }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const val = data.cell.raw;
            const color = val === 'SI' ? [240, 255, 244] : [255, 245, 245];
            const textColor = val === 'SI' ? [47, 133, 90] : [197, 48, 48];
            doc.setFillColor(...color);
            doc.roundedRect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4, 2, 2, 'F');
            doc.setTextColor(...textColor);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
          }
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(160, 174, 192);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 6
          );
          doc.text(
            'Gestión RPC — Reporte generado automáticamente',
            283,
            doc.internal.pageSize.height - 6,
            { align: 'right' }
          );
        }
      });

      doc.save(FILENAME('pdf'));
      this.showExportMenu = false;
    },

    exportCSV() {
      const escape = v => {
        const s = String(v ?? '').replace(/"/g, '""');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
      };
      const lines = [
        `# Gestión RPC — Configuración de Reportes`,
        `# Generado: ${TODAY()}`,
        `# Total de registros: ${this.reportes.length}`,
        '',
        COLUMNS.join(','),
        ...this.rowData().map(row => row.map(escape).join(','))
      ];
      this.download('﻿' + lines.join('\r\n'), FILENAME('csv'), 'text/csv;charset=utf-8;');
    },

    exportTXT() {
      const rows = this.rowData();
      const widths = COLUMNS.map((col, i) =>
        Math.max(col.length, ...rows.map(r => String(r[i] ?? '').length))
      );
      const pad = (str, len) => String(str ?? '').padEnd(len);
      const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
      const headerRow = '| ' + COLUMNS.map((c, i) => pad(c, widths[i])).join(' | ') + ' |';
      const dataRows = rows.map(r => '| ' + r.map((c, i) => pad(c, widths[i])).join(' | ') + ' |');

      const lines = [
        '='.repeat(separator.length),
        `  GESTIÓN RPC — CONFIGURACIÓN DE REPORTES`,
        `  Generado: ${TODAY()}`,
        `  Total de registros: ${this.reportes.length}`,
        '='.repeat(separator.length),
        '',
        separator,
        headerRow,
        separator.replace(/-/g, '='),
        ...dataRows.flatMap(r => [r, separator]),
        '',
        `Fin del reporte.`
      ];
      this.download(lines.join('\r\n'), FILENAME('txt'), 'text/plain;charset=utf-8;');
    }
  }
};
</script>

<style scoped>
.settings-page { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; color: #2d3748; }
.settings-header { margin-bottom: 30px; text-align: center; }
.settings-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.settings-header p { color: #718096; }
.card { background: #fff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); border: 1px solid #edf2f7; }
.card-header { display: flex; align-items: center; gap: 12px; padding: 1rem; margin-bottom: 0; }
.card-header h3 { font-size: 1.05rem; font-weight: 600; margin: 0; }
.icon-circle { width: 36px; height: 36px; background: #ebf8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.records-count { background: #f7fafc; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #718096; font-weight: 500; }

.export-wrapper { margin-left: auto; position: relative; }
.btn-export { background: #4299e1; color: #fff; border: none; padding: 7px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background .15s; white-space: nowrap; }
.btn-export:hover:not(:disabled) { background: #3182ce; }
.btn-export:disabled { opacity: .4; cursor: not-allowed; }
.arrow { font-size: .7rem; }

.opt-icon { font-size: 1.3rem; flex-shrink: 0; }
.opt-label { display: flex; flex-direction: column; }
.opt-label strong { font-size: .9rem; color: #1a202c; }
.opt-label small { font-size: .75rem; color: #718096; margin-top: 1px; }

.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f7fafc; padding: 15px; text-align: left; font-size: 0.85rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: .025em; }
.custom-table td { padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 0.95rem; }
.font-weight-bold { font-weight: 600; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }
.table-responsive { width: 100%; overflow-x: auto; }
.text-center { text-align: center; }
.text-muted { color: #718096; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
.p-4 { padding: 1rem; }
.overflow-hidden { overflow: hidden; }
.p-0 { padding: 0; }
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
