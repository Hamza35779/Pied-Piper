/* ==========================================================================
   PIED PIPER - WEISSMAN SCORE BENCHMARK ARENA
   ========================================================================== */

class WeissmanArena {
  constructor() {
    this.canvas = document.getElementById('benchmark-chart');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
  }

  getPresetData(payloadType) {
    switch (payloadType) {
      case 'code':
        return [
          { name: 'Pied Piper Middle-Out AI', ratio: 5.2, timeMs: 12, weissman: 5.28, color: '#00E676' },
          { name: 'Hooli Nucleus 2.0', ratio: 2.1, timeMs: 85, weissman: 1.42, color: '#FF1744' },
          { name: 'Brotli (Level 11)', ratio: 3.1, timeMs: 42, weissman: 2.10, color: '#00B0FF' },
          { name: 'Zstandard (v1.5)', ratio: 2.8, timeMs: 18, weissman: 2.45, color: '#7C4DFF' },
          { name: 'Gzip (Baseline)', ratio: 2.0, timeMs: 25, weissman: 1.00, color: '#94A3B8' }
        ];
      case 'json':
        return [
          { name: 'Pied Piper Middle-Out AI', ratio: 7.8, timeMs: 15, weissman: 6.12, color: '#00E676' },
          { name: 'Hooli Nucleus 2.0', ratio: 2.4, timeMs: 120, weissman: 1.15, color: '#FF1744' },
          { name: 'Brotli (Level 11)', ratio: 4.2, timeMs: 55, weissman: 2.35, color: '#00B0FF' },
          { name: 'Zstandard (v1.5)', ratio: 3.9, timeMs: 22, weissman: 2.80, color: '#7C4DFF' },
          { name: 'Gzip (Baseline)', ratio: 2.0, timeMs: 25, weissman: 1.00, color: '#94A3B8' }
        ];
      case 'media':
        return [
          { name: 'Pied Piper Middle-Out AI', ratio: 4.9, timeMs: 28, weissman: 5.04, color: '#00E676' },
          { name: 'Hooli Nucleus 2.0', ratio: 1.8, timeMs: 190, weissman: 0.85, color: '#FF1744' },
          { name: 'Brotli (Level 11)', ratio: 2.4, timeMs: 95, weissman: 1.60, color: '#00B0FF' },
          { name: 'Zstandard (v1.5)', ratio: 2.6, timeMs: 34, weissman: 2.15, color: '#7C4DFF' },
          { name: 'Gzip (Baseline)', ratio: 2.0, timeMs: 25, weissman: 1.00, color: '#94A3B8' }
        ];
      case 'hooli':
      default:
        return [
          { name: 'Pied Piper Middle-Out AI', ratio: 9.4, timeMs: 10, weissman: 8.95, color: '#00E676' },
          { name: 'Hooli Nucleus 2.0', ratio: 1.2, timeMs: 450, weissman: 0.32, color: '#FF1744' },
          { name: 'Brotli (Level 11)', ratio: 3.5, timeMs: 60, weissman: 1.95, color: '#00B0FF' },
          { name: 'Zstandard (v1.5)', ratio: 3.1, timeMs: 20, weissman: 2.30, color: '#7C4DFF' },
          { name: 'Gzip (Baseline)', ratio: 2.0, timeMs: 25, weissman: 1.00, color: '#94A3B8' }
        ];
    }
  }

  runBenchmark(payloadType = 'code') {
    const data = this.getPresetData(payloadType);
    this.renderTable(data);
    this.renderChart(data);

    if (window.ppAudio) window.ppAudio.playSuccessChime();
  }

  renderTable(data) {
    const tbody = document.getElementById('bm-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: ${item.color}">${item.name}</strong></td>
        <td>${item.ratio.toFixed(1)}x</td>
        <td>${item.timeMs} ms</td>
        <td><strong style="color: ${item.color}">${item.weissman.toFixed(2)} W</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderChart(data) {
    if (!this.canvas || !this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    const padding = 40;
    const barWidth = 45;
    const gap = (w - padding * 2 - (data.length * barWidth)) / (data.length - 1);
    const maxWeissman = Math.max(...data.map(d => d.weissman), 10);

    // Draw Y Axis Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    this.ctx.lineWidth = 1;
    this.ctx.font = '10px "Fira Code", monospace';
    this.ctx.fillStyle = '#64748B';

    for (let i = 0; i <= 5; i++) {
      const val = (maxWeissman / 5) * i;
      const y = h - padding - (i * (h - padding * 2) / 5);
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(w - padding, y);
      this.ctx.stroke();
      this.ctx.fillText(`${val.toFixed(1)}W`, 8, y + 3);
    }

    // Draw Bars
    data.forEach((item, idx) => {
      const x = padding + idx * (barWidth + gap);
      const barHeight = (item.weissman / maxWeissman) * (h - padding * 2);
      const y = h - padding - barHeight;

      // Fill Bar
      this.ctx.fillStyle = item.color;
      this.ctx.shadowColor = item.color;
      this.ctx.shadowBlur = 10;
      this.ctx.fillRect(x, y, barWidth, barHeight);
      this.ctx.shadowBlur = 0;

      // Weissman Value Text
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 11px "Fira Code", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${item.weissman.toFixed(1)}`, x + barWidth / 2, y - 8);

      // Label below bar
      this.ctx.fillStyle = '#94A3B8';
      this.ctx.font = '9px "Inter", sans-serif';
      const shortName = item.name.split(' ')[0];
      this.ctx.fillText(shortName, x + barWidth / 2, h - padding + 16);
    });

    this.ctx.textAlign = 'left';
  }
}

window.weissmanArena = new WeissmanArena();
