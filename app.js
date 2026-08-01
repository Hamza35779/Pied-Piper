/* ==========================================================================
   PIED PIPER - MAIN APPLICATION ORCHESTRATOR & EVENT BINDINGS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Init Tab Navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
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
      } else if (targetTabId === 'tab-studio' && window.fileStudio) {
        window.fileStudio.init();
      }
    });
  });

  // Theme Toggle (Dark / Light / Aviato Mode)
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  const applyTheme = (theme) => {
    const body = document.body;
    body.classList.remove('dark-theme', 'light-theme', 'aviato-theme');
    
    if (theme === 'light') {
      body.classList.add('light-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
    } else if (theme === 'aviato') {
      body.classList.add('aviato-theme');
      if (themeIcon) themeIcon.textContent = '✈️';
    } else {
      body.classList.add('dark-theme');
      if (themeIcon) themeIcon.textContent = '☀️';
    }
  };

  const savedTheme = localStorage.getItem('pp_theme') || 'dark';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      let newTheme = 'dark';

      if (body.classList.contains('dark-theme')) {
        newTheme = 'light';
      } else if (body.classList.contains('light-theme')) {
        newTheme = 'aviato';
      } else {
        newTheme = 'dark';
      }

      localStorage.setItem('pp_theme', newTheme);
      applyTheme(newTheme);
      if (window.ppAudio) window.ppAudio.playClick();
    });
  }

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

      const elOrig = document.getElementById('m-orig-size');
      const elComp = document.getElementById('m-comp-size');
      const elSav = document.getElementById('m-savings');
      const elWei = document.getElementById('m-weissman');
      const elOut = document.getElementById('mo-output-stream');

      if (elOrig) elOrig.textContent = `${res.originalSize} B`;
      if (elComp) elComp.textContent = `${res.compressedSize} B`;
      if (elSav) elSav.textContent = `${res.spaceSavedPercent}%`;
      if (elWei) elWei.textContent = `${res.weissmanScore} W`;
      if (elOut) elOut.textContent = res.compressedStream;

      const badge = document.getElementById('mo-status-badge');
      if (badge) {
        badge.textContent = 'Compressed';
        badge.className = 'badge badge-success';
      }

      window.moEngine.renderTreeAnimation(text);
      if (window.ppAudio) window.ppAudio.playCompressionSweep();
    });
  }

  if (btnResetMO && inputTextMO) {
    btnResetMO.addEventListener('click', () => {
      inputTextMO.value = '';
      const elOrig = document.getElementById('m-orig-size');
      const elComp = document.getElementById('m-comp-size');
      const elSav = document.getElementById('m-savings');
      const elWei = document.getElementById('m-weissman');
      const elOut = document.getElementById('mo-output-stream');

      if (elOrig) elOrig.textContent = '0 B';
      if (elComp) elComp.textContent = '0 B';
      if (elSav) elSav.textContent = '0.0%';
      if (elWei) elWei.textContent = '0.00 W';
      if (elOut) elOut.textContent = '// Compressed bytes will appear here...';

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
          dataset: Array.from({length: 10}, (_, i) => ({ id: i, hash: `0x${i*49281a}` }))
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
      const lblTraffic = document.getElementById('lbl-traffic');
      if (lblTraffic) lblTraffic.textContent = `${e.target.value}%`;
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

  // Initial call and direct listener binding for file studio
  const btnSample = document.getElementById('btn-sample-5tb');
  const btnExecute = document.getElementById('btn-send-chat-task');
  const inputFiles = document.getElementById('chat-attach-files');
  const inputFolder = document.getElementById('chat-attach-folder');

  if (inputFiles) {
    inputFiles.addEventListener('change', (e) => {
      if (window.fileStudio) window.fileStudio.handleAttachFiles(e.target.files);
      inputFiles.value = '';
    });
  }

  if (inputFolder) {
    inputFolder.addEventListener('change', (e) => {
      if (window.fileStudio) window.fileStudio.handleAttachFiles(e.target.files);
      inputFolder.value = '';
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (window.fileStudio) window.fileStudio.loadSample5TBDataset();
    });
  }

  if (btnExecute) {
    btnExecute.addEventListener('click', () => {
      if (window.fileStudio) window.fileStudio.executeMultiTask();
    });
  }

  if (window.fileStudio) window.fileStudio.init();
});
