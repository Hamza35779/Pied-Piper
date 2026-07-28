/* ==========================================================================
   PIED PIPER - MAIN APPLICATION ORCHESTRATOR & EVENT BINDINGS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Init Tab Navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTabId = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetEl = document.getElementById(targetTabId);
      if (targetEl) targetEl.classList.add('active');

      if (window.ppAudio) window.ppAudio.playClick();

      // Trigger sub-system initializations on tab switch
      if (targetTabId === 'tab-depin' && window.piperNet) {
        window.piperNet.init();
      } else if (targetTabId === 'tab-weissman' && window.weissmanArena) {
        window.weissmanArena.runBenchmark('code');
      }
    });
  });

  // Sound FX Toggle
  const soundBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  if (soundBtn && soundIcon) {
    soundBtn.addEventListener('click', () => {
      if (window.ppAudio) {
        const isMuted = window.ppAudio.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  // Header Logo click -> Switch to first tab
  const logoBtn = document.getElementById('logo-btn');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      const firstNav = document.querySelector('.nav-btn[data-tab="tab-middle-out"]');
      if (firstNav) firstNav.click();
    });
  }

  // CTA Compress -> Switch to File Studio tab
  const ctaCompress = document.getElementById('cta-compress');
  if (ctaCompress) {
    ctaCompress.addEventListener('click', () => {
      const studioNav = document.querySelector('.nav-btn[data-tab="tab-studio"]');
      if (studioNav) studioNav.click();
    });
  }

  // Middle-Out AI Engine Controls
  const btnRunMO = document.getElementById('btn-run-mo');
  const btnResetMO = document.getElementById('btn-reset-mo');
  const inputTextMO = document.getElementById('mo-input-text');
  const chkNeural = document.getElementById('chk-neural');
  const chkBiDir = document.getElementById('chk-bidirectional');

  if (btnRunMO && inputTextMO) {
    btnRunMO.addEventListener('click', () => {
      const text = inputTextMO.value;
      if (!text || text.trim().length === 0) {
        alert('Please enter or select a text payload to compress.');
        return;
      }

      const isNeural = chkNeural ? chkNeural.checked : true;
      const isBiDir = chkBiDir ? chkBiDir.checked : true;

      const res = window.moEngine.compress(text, isNeural, isBiDir);

      document.getElementById('m-orig-size').textContent = `${res.originalSize} B`;
      document.getElementById('m-comp-size').textContent = `${res.compressedSize} B`;
      document.getElementById('m-savings').textContent = `${res.spaceSavedPercent}%`;
      document.getElementById('m-weissman').textContent = `${res.weissmanScore} W`;
      document.getElementById('mo-output-stream').textContent = res.compressedStream;

      const badge = document.getElementById('mo-status-badge');
      if (badge) {
        badge.textContent = 'Compressed';
        badge.className = 'badge badge-success';
      }

      // Render Tree Animation
      window.moEngine.renderTreeAnimation(text);
      if (window.ppAudio) window.ppAudio.playCompressionSweep();
    });
  }

  if (btnResetMO && inputTextMO) {
    btnResetMO.addEventListener('click', () => {
      inputTextMO.value = '';
      document.getElementById('m-orig-size').textContent = '0 B';
      document.getElementById('m-comp-size').textContent = '0 B';
      document.getElementById('m-savings').textContent = '0.0%';
      document.getElementById('m-weissman').textContent = '0.00 W';
      document.getElementById('mo-output-stream').textContent = '// Compressed bytes will appear here...';

      const badge = document.getElementById('mo-status-badge');
      if (badge) {
        badge.textContent = 'Ready';
        badge.className = 'badge badge-idle';
      }

      const canvas = document.getElementById('mo-tree-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      const overlay = document.getElementById('mo-tree-overlay');
      if (overlay) overlay.style.display = 'block';
    });
  }

  // Preset sample loader buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-sample');
      let sampleText = "";
      if (type === 'json') {
        sampleText = JSON.stringify({
          app: "PiedPiper",
          version: "4.2.0",
          nodes: 14892,
          algorithm: "Middle-Out Neural",
          entropy_reduction: 0.88,
          dataset: Array.from({length: 20}, (_, i) => ({ id: i, hash: `0x${i*49281a}` }))
        }, null, 2);
      } else if (type === 'code') {
        sampleText = `function middleOutCompress(buffer) {
  let head = 0, tail = buffer.length - 1;
  const dictionary = new Map();
  while (head < tail) {
    compressBytePair(buffer[head++], buffer[tail--], dictionary);
  }
  return assemblePiperStream(dictionary);
}`;
      } else if (type === 'ai') {
        sampleText = `You are Pied Piper AI. Compress this high-dimensional context vector token payload from 128,000 tokens down to 12,000 tokens without losing any semantic memory or lossy attention quality.`;
      } else if (type === 'hooli') {
        sampleText = `HOOLI_NUCLEUS_INTERNAL_SECRET: Project Nucleus is failing. We copied Pied Piper's algorithm from TechCrunch Disrupt demo, but our single-directional compression causes 400ms latency spikes and memory leaks.`;
      }

      if (inputTextMO) inputTextMO.value = sampleText;
      if (window.ppAudio) window.ppAudio.playClick();
    });
  });

  // DePIN Controls
  const btnAddNode = document.getElementById('btn-add-node');
  const btnPingAll = document.getElementById('btn-ping-all');
  const btnClearNodes = document.getElementById('btn-clear-nodes');
  const sliderTraffic = document.getElementById('slider-traffic');

  if (btnAddNode) btnAddNode.addEventListener('click', () => window.piperNet.addRandomNode());
  if (btnPingAll) btnPingAll.addEventListener('click', () => window.piperNet.pulsePing());
  if (btnClearNodes) btnClearNodes.addEventListener('click', () => window.piperNet.seedNodes());

  if (sliderTraffic) {
    sliderTraffic.addEventListener('input', (e) => {
      document.getElementById('lbl-traffic').textContent = `${e.target.value}%`;
      window.piperNet.setTrafficLoad(parseInt(e.target.value));
    });
  }

  // Weissman Arena Controls
  const btnBenchmark = document.getElementById('btn-run-benchmark');
  const selBenchmark = document.getElementById('sel-benchmark-payload');
  if (btnBenchmark && selBenchmark) {
    btnBenchmark.addEventListener('click', () => {
      window.weissmanArena.runBenchmark(selBenchmark.value);
    });
  }

  // Copy MO Stream button
  const btnCopyMO = document.getElementById('btn-copy-mo');
  if (btnCopyMO) {
    btnCopyMO.addEventListener('click', () => {
      const streamText = document.getElementById('mo-output-stream').textContent;
      navigator.clipboard.writeText(streamText);
      btnCopyMO.textContent = 'Copied!';
      setTimeout(() => btnCopyMO.textContent = 'Copy Stream', 2000);
    });
  }

  // Footer Easter Egg Links
  const linkHooli = document.getElementById('link-hooli-alert');
  const linkAlwaysBlue = document.getElementById('link-always-blue');
  const linkWeissmanDocs = document.getElementById('link-weissman-docs');

  if (linkHooli) {
    linkHooli.addEventListener('click', (e) => {
      e.preventDefault();
      alert('⚠️ HOOLI ALERT: Hooli Nucleus 2.0 has been officially canceled by Gavin Belson following disastrous Weissman score benchmarks!');
    });
  }

  if (linkAlwaysBlue) {
    linkAlwaysBlue.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.ppAudio) window.ppAudio.playSuccessChime();
      alert('🔵 ALWAYS BLUE! ALWAYS BLUE! ALWAYS BLUE!');
    });
  }

  if (linkWeissmanDocs) {
    linkWeissmanDocs.addEventListener('click', (e) => {
      e.preventDefault();
      const tabWeissman = document.querySelector('.nav-btn[data-tab="tab-weissman"]');
      if (tabWeissman) tabWeissman.click();
    });
  }

  // Load default preset into Middle-Out text box
  const firstPreset = document.querySelector('.preset-btn[data-sample="json"]');
  if (firstPreset) firstPreset.click();
});
