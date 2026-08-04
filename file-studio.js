/* ==========================================================================
   PIED PIPER — MIDDLE-OUT™ COMPRESSION ENGINE
   Real-world file compression using native browser APIs
   Inspired by HBO's Silicon Valley
   ========================================================================== */

class PiedPiperEngine {

  static MODES = {
    jared:    { name: 'Jared',    desc: 'Max Quality',    icon: '🐢', imageQuality: 0.92, videoBitrate: 2500000 },
    richard:  { name: 'Richard',  desc: 'Balanced',       icon: '⚡', imageQuality: 0.75, videoBitrate: 1200000 },
    gilfoyle: { name: 'Gilfoyle', desc: 'Max Compress',   icon: '🔥', imageQuality: 0.55, videoBitrate: 600000  }
  };

  constructor() {
    this.attachedItems = [];
    this.compressedBlobs = new Map();
    this.currentMode = 'richard';
    this.history = this.loadHistory();
    this.isProcessing = false;
  }

  /* ── DOM References ─────────────────────────────────────────────────── */

  el(id) { return document.getElementById(id); }

  /* ── Initialization & Event Binding ─────────────────────────────────── */

  init() {
    const fileInput = this.el('direct-file-input');
    if (fileInput) {
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleAttachFiles(e.target.files);
          this.executeCompression();
        }
      };
    }

    // Drag-and-drop
    const dropzone = document.querySelector('.chat-upload-wrapper');
    if (dropzone) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); }, false);
      });
      dropzone.addEventListener('dragover', () => {
        dropzone.style.borderColor = 'var(--accent-green)';
        dropzone.style.background = 'rgba(0, 230, 118, 0.08)';
      });
      ['dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, () => {
          dropzone.style.borderColor = '';
          dropzone.style.background = '';
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleAttachFiles(e.dataTransfer.files);
          this.executeCompression();
        }
      });
    }

    // Buttons
    const btnSample = this.el('btn-sample-5tb');
    if (btnSample) btnSample.onclick = (e) => { e.preventDefault(); this.loadSampleDataset(); this.executeCompression(); };

    const btnExecute = this.el('btn-send-chat-task');
    if (btnExecute) btnExecute.onclick = (e) => { e.preventDefault(); this.executeCompression(); };

    const btnDownload = this.el('btn-download-pp');
    if (btnDownload) btnDownload.onclick = (e) => { e.preventDefault(); this.downloadCompressed(); };

    const btnExport = this.el('btn-export-website');
    if (btnExport) btnExport.onclick = (e) => { e.preventDefault(); this.exportLink(); };

    const btnClearHist = this.el('btn-clear-history');
    if (btnClearHist) btnClearHist.onclick = () => { this.history = []; sessionStorage.removeItem('pp_history'); this.renderHistory(); };

    // Compression mode radios
    document.querySelectorAll('input[name="compression-mode"]').forEach(radio => {
      radio.onchange = () => { this.currentMode = radio.value; };
    });

    // Render initial history
    this.renderHistory();
  }

  /* ── File Handling ──────────────────────────────────────────────────── */

  handleAttachFiles(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      this.attachedItems.push({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        size: file.size,
        fileObj: file
      });
    });
    this.renderChips();
    if (window.ppAudio) window.ppAudio.playClick();
  }

  loadSampleDataset() {
    const enc = new TextEncoder();
    const makeFile = (name, content, type) => {
      const blob = new Blob([enc.encode(content)], { type });
      return { name, path: name, size: blob.size, fileObj: new File([blob], name.split('/').pop()) };
    };

    this.attachedItems = [
      makeFile('hooli_leaked_logs/server_dump.log',
        'HOOLI NUCLEUS ERROR LOG — CONFIDENTIAL\n' + '[ERROR] Gavin Belson approved merge without code review\n'.repeat(500),
        'text/plain'),
      makeFile('bachmanity_insanity/conference_data.json',
        JSON.stringify({ event: 'Bachmanity Insanity', budget: 500000, attendees: 4200, roi: -100, quote: 'Erlich funded this with his Aviato money', sessions: Array.from({length: 200}, (_, i) => ({ id: i, title: `Session ${i}`, speaker: 'TBD' })) }, null, 2),
        'application/json'),
      makeFile('piedpiper_src/middle_out_core.cpp',
        '#include <middle_out.h>\n// Richard Hendricks - Middle-Out Compression Core\n' + 'void compress_block(uint8_t* data, size_t len) {\n  // Bi-directional traversal from middle pivot\n  size_t mid = len / 2;\n  for (size_t i = 0; i < mid; i++) { /* forward pass */ }\n  for (size_t i = len-1; i >= mid; i--) { /* reverse pass */ }\n}\n'.repeat(200),
        'text/x-c++src'),
      makeFile('genomics/dna_sequence.fasta',
        '>PIED_PIPER_GENOME_v4.2\n' + 'ATCGATCGATCGTAGCTAGCTAGCGATCGATCGATCG\n'.repeat(500),
        'text/plain')
    ];

    this.renderChips();
    if (window.ppAudio) window.ppAudio.playClick();
  }

  renderChips() {
    const container = this.el('attached-chips-container');
    if (!container) return;
    container.innerHTML = '';

    if (this.attachedItems.length === 0) {
      container.innerHTML = '<span class="chip-hint">No files attached. Choose files above or drag & drop here.</span>';
      return;
    }

    this.attachedItems.forEach((item, idx) => {
      const chip = document.createElement('div');
      chip.className = 'file-chip';
      const icon = this.fileIcon(item.name);
      chip.innerHTML = `<span>${icon} ${item.name} (${this.fmtBytes(item.size)})</span><span class="chip-remove" data-idx="${idx}">×</span>`;
      container.appendChild(chip);
    });

    container.querySelectorAll('.chip-remove').forEach(btn => {
      btn.onclick = (e) => {
        this.attachedItems.splice(parseInt(e.target.dataset.idx), 1);
        this.renderChips();
      };
    });
  }

  /* ── CORE COMPRESSION ENGINE ────────────────────────────────────────── */

  async executeCompression() {
    if (this.isProcessing) return;
    if (this.attachedItems.length === 0) this.loadSampleDataset();

    this.isProcessing = true;
    this.compressedBlobs.clear();
    const mode = PiedPiperEngine.MODES[this.currentMode];

    // Show progress UI
    const progBlock = this.el('stream-progress-block');
    if (progBlock) progBlock.classList.remove('hidden');
    this.updateMainProgress(0, 'Initializing Middle-Out™ Engine...', '—', '—', '—');

    if (window.ppAudio) window.ppAudio.playCompressionSweep();

    // Show queue
    this.renderQueue('init');

    const results = [];
    const totalFiles = this.attachedItems.length;

    for (let i = 0; i < totalFiles; i++) {
      const item = this.attachedItems[i];
      const file = item.fileObj;
      if (!file) continue;

      this.updateQueueItemStatus(i, 'compressing', 0);

      const startTime = performance.now();
      let compressedBlob;
      let outputName;
      let strategy;

      const name = file.name.toLowerCase();
      const type = file.type || '';
      const isGz = name.endsWith('.gz');
      const isImage = type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name);
      const isVideo = type.startsWith('video/') || /\.(mp4|webm|mkv|avi|mov|flv)$/i.test(name);
      const isAudio = type.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac)$/i.test(name);

      try {
        if (isGz) {
          // AUTO-DECOMPRESS .gz files
          strategy = 'decompress';
          this.updateMainProgress((i / totalFiles) * 100, `Decompressing: ${file.name}`, '—', '—', '—');
          compressedBlob = await this.decompressGzip(file, (done, total) => {
            const pct = (done / total) * 100;
            this.updateQueueItemStatus(i, 'compressing', pct);
            this.updateMainProgress(((i + done / total) / totalFiles) * 100, `Decompressing: ${file.name}`, this.fmtBytes(done) + ' / ' + this.fmtBytes(total), '—', '—');
          });
          outputName = file.name.replace(/\.gz$/i, '') || 'decompressed_file';

        } else if (isImage) {
          strategy = 'image';
          this.updateMainProgress((i / totalFiles) * 100, `Compressing image: ${file.name}`, '—', '—', '—');
          compressedBlob = await this.compressImage(file, mode.imageQuality);
          outputName = file.name;
          this.updateQueueItemStatus(i, 'compressing', 100);

        } else if (isVideo) {
          strategy = 'video';
          this.updateMainProgress((i / totalFiles) * 100, `Re-encoding video: ${file.name} (real-time)`, '—', '—', '⚠️ Real-time');
          compressedBlob = await this.compressVideo(file, mode.videoBitrate, (current, total) => {
            const pct = (current / total) * 100;
            this.updateQueueItemStatus(i, 'compressing', pct);
            const remaining = ((total - current) > 0) ? this.fmtTime((total - current) * 1000) : '00:00';
            this.updateMainProgress(((i + current / total) / totalFiles) * 100, `Re-encoding: ${file.name}`, this.fmtTime(current * 1000) + ' / ' + this.fmtTime(total * 1000), '—', remaining);
          });
          outputName = file.name.replace(/\.[^.]+$/, '.webm');

        } else if (isAudio) {
          // Audio → gzip (browser can't transcode audio easily)
          strategy = 'gzip';
          compressedBlob = await this.compressWithGzip(file, (done, total) => {
            this.updateQueueItemStatus(i, 'compressing', (done / total) * 100);
            this.updateCompressionMetrics(i, totalFiles, file.name, done, total, startTime);
          });
          outputName = file.name + '.gz';

        } else {
          // Everything else → gzip
          strategy = 'gzip';
          compressedBlob = await this.compressWithGzip(file, (done, total) => {
            this.updateQueueItemStatus(i, 'compressing', (done / total) * 100);
            this.updateCompressionMetrics(i, totalFiles, file.name, done, total, startTime);
          });
          outputName = file.name + '.gz';
        }
      } catch (err) {
        console.error('Compression error:', err);
        compressedBlob = file;
        outputName = file.name;
        strategy = 'passthrough';
      }

      const elapsedMs = performance.now() - startTime;
      const origSize = file.size;
      const compSize = compressedBlob.size;
      const isDecomp = strategy === 'decompress';
      const ratio = isDecomp ? (compSize / Math.max(1, origSize)) : (origSize / Math.max(1, compSize));
      const savings = isDecomp ? 0 : Math.max(0, ((origSize - compSize) / origSize) * 100);
      const weissman = isDecomp ? 0 : this.calculateWeissman(origSize, compSize, elapsedMs);

      this.compressedBlobs.set(outputName, compressedBlob);

      const result = {
        originalName: file.name,
        outputName,
        origSize,
        compSize,
        ratio: Math.round(ratio * 100) / 100,
        savings: Math.round(savings * 10) / 10,
        weissman: Math.round(weissman * 100) / 100,
        elapsedMs: Math.round(elapsedMs),
        strategy,
        isDecompression: isDecomp,
        timestamp: Date.now()
      };

      results.push(result);
      this.updateQueueItemStatus(i, 'done', 100, result);
      this.addToHistory(result);
    }

    // Final progress
    this.updateMainProgress(100, '✅ Middle-Out™ Pipeline Complete!', 'All files processed', '—', '00:00 (Done)');
    const etaEl = this.el('prog-eta');
    if (etaEl) etaEl.className = 'accent-green';

    // Render results
    this.renderResultsSummary(results);
    this.renderDirectoryTree(results);
    this.renderHistory();

    // Show first file preview + comparison
    if (results.length > 0) {
      const first = results[0];
      const firstBlob = this.compressedBlobs.get(first.outputName);
      this.renderPreview(firstBlob, first.outputName);
      this.renderComparison(this.attachedItems[0].fileObj, firstBlob, first);
    }

    // Show download controls
    const controlsBar = this.el('workspace-controls');
    if (controlsBar) {
      controlsBar.classList.remove('hidden');
      const archName = this.el('arch-name');
      const archSav = this.el('arch-savings');
      if (results.length === 1) {
        if (archName) archName.textContent = results[0].outputName;
        if (archSav) archSav.textContent = results[0].isDecompression
          ? `Decompressed (${this.fmtBytes(results[0].compSize)})`
          : `Saved ${results[0].savings}% (${this.fmtBytes(results[0].compSize)}) — W: ${results[0].weissman}`;
      } else {
        const totalOrig = results.reduce((s, r) => s + r.origSize, 0);
        const totalComp = results.reduce((s, r) => s + r.compSize, 0);
        const totalSavings = Math.max(0, ((totalOrig - totalComp) / totalOrig) * 100).toFixed(1);
        if (archName) archName.textContent = `${results.length} files compressed`;
        if (archSav) archSav.textContent = `Total: ${this.fmtBytes(totalOrig)} → ${this.fmtBytes(totalComp)} (${totalSavings}% saved)`;
      }
    }

    this.isProcessing = false;
    if (window.ppAudio) window.ppAudio.playSuccessChime();
  }

  /* ── Real Gzip Compression (Native Browser API) ─────────────────────── */

  async compressWithGzip(file, onProgress) {
    const totalBytes = file.size;
    let bytesProcessed = 0;

    const progressTracker = new TransformStream({
      transform(chunk, controller) {
        bytesProcessed += chunk.byteLength;
        if (onProgress) onProgress(bytesProcessed, totalBytes);
        controller.enqueue(chunk);
      }
    });

    const compressedStream = file.stream()
      .pipeThrough(progressTracker)
      .pipeThrough(new CompressionStream('gzip'));

    const reader = compressedStream.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return new Blob(chunks, { type: 'application/gzip' });
  }

  /* ── Real Gzip Decompression (Native Browser API) ───────────────────── */

  async decompressGzip(file, onProgress) {
    const totalBytes = file.size;
    let bytesProcessed = 0;

    const progressTracker = new TransformStream({
      transform(chunk, controller) {
        bytesProcessed += chunk.byteLength;
        if (onProgress) onProgress(bytesProcessed, totalBytes);
        controller.enqueue(chunk);
      }
    });

    const decompressedStream = file.stream()
      .pipeThrough(progressTracker)
      .pipeThrough(new DecompressionStream('gzip'));

    const reader = decompressedStream.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const origName = file.name.replace(/\.gz$/i, '');
    return new Blob(chunks, { type: this.guessMime(origName) });
  }

  /* ── Canvas Image Compression ───────────────────────────────────────── */

  compressImage(file, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);

        const format = (file.type === 'image/png') ? 'image/png' : 'image/jpeg';
        canvas.toBlob(blob => {
          URL.revokeObjectURL(img.src);
          resolve(blob && blob.size < file.size ? blob : file);
        }, format, quality);
      };
      img.onerror = () => { URL.revokeObjectURL(img.src); resolve(file); };
      img.src = URL.createObjectURL(file);
    });
  }

  /* ── MediaRecorder Video Compression ────────────────────────────────── */

  compressVideo(file, bitrate, onProgress) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) { URL.revokeObjectURL(url); resolve(file); return; }

        try {
          const stream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null);
          if (!stream) { URL.revokeObjectURL(url); resolve(file); return; }

          let mime = 'video/webm;codecs=vp9';
          if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';

          const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate });
          const chunks = [];

          recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

          recorder.onstop = () => {
            URL.revokeObjectURL(url);
            clearInterval(tick);
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob.size > 0 ? blob : file);
          };

          const tick = setInterval(() => {
            if (onProgress && duration > 0) onProgress(video.currentTime, duration);
          }, 250);

          video.onended = () => {
            if (onProgress) onProgress(duration, duration);
            setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 200);
          };

          video.play().catch(() => {});
          recorder.start(1000);

          // Safety timeout
          setTimeout(() => {
            clearInterval(tick);
            if (recorder.state !== 'inactive') { recorder.stop(); video.pause(); }
          }, (duration * 1000) + 3000);

        } catch (err) { URL.revokeObjectURL(url); resolve(file); }
      };

      video.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    });
  }

  /* ── Weissman Score Calculation ─────────────────────────────────────── */

  calculateWeissman(origSize, compSize, elapsedMs) {
    const ratio = origSize / Math.max(1, compSize);
    const speedMBps = (origSize / (1024 * 1024)) / Math.max(0.001, elapsedMs / 1000);

    // Calibrated to produce Silicon Valley-accurate scores (2.0–6.0 range)
    const W = 0.8 * Math.log2(ratio + 1) * Math.log10(speedMBps + 10);
    return Math.max(0.1, Math.min(9.99, W));
  }

  /* ── Progress UI Updates ────────────────────────────────────────────── */

  updateMainProgress(percent, statusText, chunksText, speedText, etaText) {
    const fill = this.el('progress-bar-fill');
    const pctEl = this.el('progress-percent');
    const txtEl = this.el('progress-status-text');
    const chunkEl = this.el('prog-chunks');
    const speedEl = this.el('prog-speed');
    const etaEl = this.el('prog-eta');

    if (fill) fill.style.width = percent + '%';
    if (pctEl) pctEl.textContent = Math.round(percent) + '%';
    if (txtEl) txtEl.textContent = statusText;
    if (chunkEl) chunkEl.textContent = chunksText;
    if (speedEl) speedEl.textContent = speedText;
    if (etaEl) etaEl.textContent = etaText;
  }

  updateCompressionMetrics(fileIdx, totalFiles, fileName, bytesProcessed, totalBytes, startTime) {
    const elapsed = (performance.now() - startTime) / 1000;
    const speed = elapsed > 0 ? bytesProcessed / elapsed : 0;
    const remaining = speed > 0 ? (totalBytes - bytesProcessed) / speed : 0;
    const overallPct = ((fileIdx + bytesProcessed / totalBytes) / totalFiles) * 100;

    this.updateMainProgress(
      overallPct,
      `Middle-Out™ Compressing: ${fileName}`,
      this.fmtBytes(bytesProcessed) + ' / ' + this.fmtBytes(totalBytes),
      this.fmtBytes(speed) + '/s',
      this.fmtTime(remaining * 1000)
    );
  }

  /* ── Queue Rendering ────────────────────────────────────────────────── */

  renderQueue(phase) {
    const queueEl = this.el('compression-queue');
    const itemsEl = this.el('queue-items');
    const countEl = this.el('queue-count');
    if (!queueEl || !itemsEl) return;

    queueEl.classList.remove('hidden');
    if (countEl) countEl.textContent = this.attachedItems.length + ' files';
    itemsEl.innerHTML = '';

    this.attachedItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'queue-item';
      row.id = `queue-item-${idx}`;
      row.innerHTML = `
        <div class="queue-item-info">
          <span class="queue-icon">${this.fileIcon(item.name)}</span>
          <span class="queue-name">${item.name}</span>
          <span class="queue-size">${this.fmtBytes(item.size)}</span>
        </div>
        <div class="queue-item-progress">
          <div class="queue-progress-track"><div class="queue-progress-fill" id="qpf-${idx}" style="width:0%"></div></div>
          <span class="queue-percent" id="qpct-${idx}">0%</span>
        </div>
        <div class="queue-item-result" id="qres-${idx}"></div>
        <span class="queue-status" id="qstat-${idx}">🕐</span>
      `;
      itemsEl.appendChild(row);
    });
  }

  updateQueueItemStatus(idx, status, percent, result) {
    const fill = this.el(`qpf-${idx}`);
    const pct = this.el(`qpct-${idx}`);
    const stat = this.el(`qstat-${idx}`);
    const res = this.el(`qres-${idx}`);

    if (fill) fill.style.width = Math.round(percent) + '%';
    if (pct) pct.textContent = Math.round(percent) + '%';

    if (status === 'compressing') {
      if (stat) stat.textContent = '⏳';
    } else if (status === 'done' && result) {
      if (stat) stat.textContent = '✅';
      if (pct) pct.textContent = '100%';
      if (fill) fill.style.width = '100%';
      if (res) {
        if (result.isDecompression) {
          res.innerHTML = `<span class="accent-blue">→ ${this.fmtBytes(result.compSize)} (decompressed)</span>`;
        } else {
          res.innerHTML = `<span class="accent-green">→ ${this.fmtBytes(result.compSize)} (${result.savings}% saved) W:${result.weissman}</span>`;
        }
      }
    }
  }

  /* ── Results Summary ────────────────────────────────────────────────── */

  renderResultsSummary(results) {
    const box = this.el('ai-task-results-box');
    const textEl = this.el('ai-summary-text');
    if (!box || !textEl) return;

    box.classList.remove('hidden');

    const totalOrig = results.reduce((s, r) => s + r.origSize, 0);
    const totalComp = results.reduce((s, r) => s + r.compSize, 0);
    const totalSavings = totalOrig > 0 ? ((totalOrig - totalComp) / totalOrig * 100).toFixed(1) : '0';
    const avgWeissman = results.filter(r => !r.isDecompression).reduce((s, r) => s + r.weissman, 0) / Math.max(1, results.filter(r => !r.isDecompression).length);
    const totalTime = results.reduce((s, r) => s + r.elapsedMs, 0);

    const modeName = PiedPiperEngine.MODES[this.currentMode].name;
    const modeIcon = PiedPiperEngine.MODES[this.currentMode].icon;

    let summary = `✅ MIDDLE-OUT™ COMPRESSION COMPLETE\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    summary += `Mode: ${modeIcon} ${modeName} Mode\n`;
    summary += `Files Processed: ${results.length}\n`;
    summary += `Total: ${this.fmtBytes(totalOrig)} → ${this.fmtBytes(totalComp)} (${totalSavings}% reduced)\n`;
    summary += `Weissman Score: ${avgWeissman.toFixed(2)} W\n`;
    summary += `Time: ${this.fmtTime(totalTime)}\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    results.forEach((r, i) => {
      if (r.isDecompression) {
        summary += `${i + 1}. 📦 ${r.originalName}\n   Decompressed: ${this.fmtBytes(r.origSize)} → ${this.fmtBytes(r.compSize)}\n\n`;
      } else {
        summary += `${i + 1}. ${this.fileIcon(r.originalName)} ${r.originalName}\n   ${this.fmtBytes(r.origSize)} → ${this.fmtBytes(r.compSize)} (${r.savings}% saved) | ${r.ratio}x ratio | W: ${r.weissman} | ${this.fmtTime(r.elapsedMs)}\n   Strategy: ${r.strategy} | Output: ${r.outputName}\n\n`;
      }
    });

    summary += `"Making the world a better place... through compression." — Pied Piper`;

    textEl.textContent = summary;
  }

  /* ── Before/After Comparison Panel ──────────────────────────────────── */

  renderComparison(originalFile, compressedBlob, result) {
    const panel = this.el('comparison-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    const origPrev = this.el('comparison-original-preview');
    const compPrev = this.el('comparison-compressed-preview');
    const origSizeEl = this.el('comp-orig-size');
    const newSizeEl = this.el('comp-new-size');
    const weissEl = this.el('comp-weissman');
    const savEl = this.el('comp-savings');
    const origFmtEl = this.el('comp-orig-format');
    const newFmtEl = this.el('comp-new-format');

    if (origSizeEl) origSizeEl.textContent = this.fmtBytes(result.origSize);
    if (newSizeEl) newSizeEl.textContent = this.fmtBytes(result.compSize);
    if (weissEl) weissEl.textContent = result.isDecompression ? 'N/A' : `W: ${result.weissman}`;
    if (savEl) savEl.textContent = result.isDecompression ? 'Decompressed' : `-${result.savings}%`;
    if (origFmtEl) origFmtEl.textContent = this.getExt(result.originalName).toUpperCase();
    if (newFmtEl) newFmtEl.textContent = this.getExt(result.outputName).toUpperCase();

    // Render previews
    if (origPrev) this.renderMiniPreview(origPrev, originalFile);
    if (compPrev) this.renderMiniPreview(compPrev, compressedBlob);
  }

  renderMiniPreview(container, fileOrBlob) {
    container.innerHTML = '';
    if (!fileOrBlob) { container.innerHTML = '<span class="preview-placeholder">No preview</span>'; return; }

    const type = fileOrBlob.type || '';
    const name = (fileOrBlob.name || '').toLowerCase();
    const url = URL.createObjectURL(fileOrBlob);

    if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name)) {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'comparison-img';
      container.appendChild(img);
    } else if (type.startsWith('video/') || /\.(mp4|webm|mkv)$/i.test(name)) {
      const vid = document.createElement('video');
      vid.src = url;
      vid.controls = true;
      vid.muted = true;
      vid.className = 'comparison-video';
      container.appendChild(vid);
    } else {
      container.innerHTML = `<div class="preview-placeholder"><span class="preview-icon">${this.fileIcon(name)}</span><span>${this.fmtBytes(fileOrBlob.size)}</span></div>`;
    }
  }

  /* ── Media Preview ──────────────────────────────────────────────────── */

  renderPreview(blob, filename) {
    const viewer = this.el('workspace-viewer');
    if (!viewer || !blob) return;
    viewer.innerHTML = '';

    const type = blob.type || '';
    const name = filename.toLowerCase();
    const url = URL.createObjectURL(blob);

    if (type.startsWith('video/') || /\.(mp4|webm|mkv)$/i.test(name)) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'width:100%;text-align:center;';
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.playsInline = true;
      video.style.cssText = 'width:100%;max-height:360px;border-radius:8px;background:#000;box-shadow:0 4px 20px rgba(0,0,0,0.6);';
      const btn = document.createElement('button');
      btn.className = 'btn-primary btn-mini';
      btn.style.marginTop = '10px';
      btn.textContent = '▶ Play Compressed Video';
      btn.onclick = () => video.play();
      wrap.appendChild(video);
      wrap.appendChild(btn);
      viewer.appendChild(wrap);

    } else if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name)) {
      const img = document.createElement('img');
      img.src = url;
      img.style.cssText = 'max-width:100%;max-height:320px;border-radius:8px;';
      viewer.appendChild(img);

    } else if (type.startsWith('audio/') || /\.(mp3|wav|ogg|aac)$/i.test(name)) {
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      viewer.appendChild(audio);

    } else {
      viewer.innerHTML = `<div class="placeholder-text"><span>${this.fileIcon(filename)} ${filename} — ${this.fmtBytes(blob.size)}</span><span style="margin-top:8px;color:var(--text-muted);">Download to open with your system's default application</span></div>`;
    }
  }

  /* ── Directory Tree ─────────────────────────────────────────────────── */

  renderDirectoryTree(results) {
    const wrapper = this.el('compressed-tree-wrapper');
    const ul = this.el('compressed-tree-ul');
    if (!wrapper || !ul) return;

    wrapper.classList.remove('hidden');
    ul.innerHTML = '';

    results.forEach((result, idx) => {
      const li = document.createElement('li');
      li.className = 'tree-item';
      const icon = this.fileIcon(result.outputName);
      li.innerHTML = `
        <span>${icon} ${result.outputName}</span>
        <span style="color:var(--accent-green);font-weight:bold;">${this.fmtBytes(result.compSize)} ${result.isDecompression ? '[Decompressed]' : '[' + result.savings + '% saved]'}</span>
      `;
      li.onclick = () => {
        ul.querySelectorAll('.tree-item').forEach(i => i.classList.remove('tree-item-active'));
        li.classList.add('tree-item-active');
        const blob = this.compressedBlobs.get(result.outputName);
        if (blob) this.renderPreview(blob, result.outputName);
      };
      ul.appendChild(li);
    });
  }

  /* ── Session History ────────────────────────────────────────────────── */

  loadHistory() {
    try {
      return JSON.parse(sessionStorage.getItem('pp_history') || '[]');
    } catch { return []; }
  }

  addToHistory(result) {
    this.history.push(result);
    try { sessionStorage.setItem('pp_history', JSON.stringify(this.history)); } catch {}
  }

  renderHistory() {
    const panel = this.el('session-history');
    const itemsEl = this.el('history-items');
    const totalsEl = this.el('history-totals');
    if (!panel || !itemsEl) return;

    if (this.history.length === 0) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');
    itemsEl.innerHTML = '';

    this.history.slice().reverse().forEach((h, idx) => {
      const row = document.createElement('div');
      row.className = 'history-row';
      const ago = this.timeAgo(h.timestamp);
      if (h.isDecompression) {
        row.innerHTML = `<span class="history-idx">#${this.history.length - idx}</span><span class="history-name">${h.originalName}</span><span class="accent-blue">${this.fmtBytes(h.origSize)} → ${this.fmtBytes(h.compSize)} (decompressed)</span><span class="history-ago">${ago}</span>`;
      } else {
        row.innerHTML = `<span class="history-idx">#${this.history.length - idx}</span><span class="history-name">${h.originalName}</span><span class="accent-green">${this.fmtBytes(h.origSize)} → ${this.fmtBytes(h.compSize)} (${h.savings}%)</span><span class="history-weissman">W:${h.weissman}</span><span class="history-ago">${ago}</span>`;
      }
      itemsEl.appendChild(row);
    });

    if (totalsEl) {
      const compJobs = this.history.filter(h => !h.isDecompression);
      const totalOrig = compJobs.reduce((s, h) => s + h.origSize, 0);
      const totalComp = compJobs.reduce((s, h) => s + h.compSize, 0);
      const totalSaved = totalOrig > 0 ? ((totalOrig - totalComp) / totalOrig * 100).toFixed(1) : '0';
      totalsEl.innerHTML = `<strong>Session Total:</strong> ${this.fmtBytes(totalOrig)} → ${this.fmtBytes(totalComp)} (${totalSaved}% saved across ${compJobs.length} compressions)`;
    }
  }

  /* ── Download & Export ──────────────────────────────────────────────── */

  downloadCompressed() {
    if (this.compressedBlobs.size === 0) return;

    if (this.compressedBlobs.size === 1) {
      const [name, blob] = [...this.compressedBlobs.entries()][0];
      this.triggerDownload(blob, name);
    } else {
      // Download all as individual files
      this.compressedBlobs.forEach((blob, name) => {
        this.triggerDownload(blob, name);
      });
    }
  }

  triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  exportLink() {
    if (this.compressedBlobs.size === 0) return;
    const [, blob] = [...this.compressedBlobs.entries()][0];
    window.open(URL.createObjectURL(blob), '_blank');
  }

  /* ── Utility Helpers ────────────────────────────────────────────────── */

  fmtBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
  }

  fmtTime(ms) {
    if (!ms || ms <= 0) return '00:00';
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return Math.round(diff / 1000) + 's ago';
    if (diff < 3600000) return Math.round(diff / 60000) + 'm ago';
    return Math.round(diff / 3600000) + 'h ago';
  }

  fileIcon(name) {
    const n = (name || '').toLowerCase();
    if (/\.(mp4|webm|mkv|avi|mov)$/i.test(n)) return '🎬';
    if (/\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(n)) return '🖼️';
    if (/\.(mp3|wav|ogg|aac|flac)$/i.test(n)) return '🎵';
    if (/\.(json)$/i.test(n)) return '📋';
    if (/\.(js|ts|py|cpp|c|h|java|rs|go)$/i.test(n)) return '💻';
    if (/\.(sql|db)$/i.test(n)) return '🗄️';
    if (/\.(pdf)$/i.test(n)) return '📕';
    if (/\.(zip|gz|tar|rar|7z)$/i.test(n)) return '📦';
    if (/\.(log|txt|md|csv)$/i.test(n)) return '📄';
    return '📄';
  }

  getExt(name) {
    const parts = (name || '').split('.');
    return parts.length > 1 ? parts.pop() : 'BIN';
  }

  guessMime(name) {
    const ext = this.getExt(name).toLowerCase();
    const map = {
      'json': 'application/json', 'js': 'text/javascript', 'html': 'text/html',
      'css': 'text/css', 'txt': 'text/plain', 'csv': 'text/csv', 'xml': 'text/xml',
      'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'gif': 'image/gif',
      'svg': 'image/svg+xml', 'webp': 'image/webp', 'mp4': 'video/mp4', 'webm': 'video/webm',
      'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'pdf': 'application/pdf'
    };
    return map[ext] || 'application/octet-stream';
  }
}

/* ── Bootstrap ────────────────────────────────────────────────────────── */

window.fileStudio = new PiedPiperEngine();
window.fileStudio.init();

/* Legacy compat — called by index.html event handlers */
window.handleDirectFileSelect = function(e) {
  const files = e?.target?.files || e?.dataTransfer?.files;
  if (files && files.length > 0) {
    window.fileStudio.handleAttachFiles(files);
    window.fileStudio.executeCompression();
  }
};

window.loadSampleAndProcess = function(e) {
  if (e) e.preventDefault();
  window.fileStudio.loadSampleDataset();
  window.fileStudio.executeCompression();
};

window.executePipelineTask = function(e) {
  if (e) e.preventDefault();
  window.fileStudio.executeCompression();
};
