/* ==========================================================================
   PIED PIPER PRO - MAIN APPLICATION ORCHESTRATOR & GLOBAL EVENT HANDLERS
   ========================================================================== */

// Global Fail-Safe Tab Switcher
window.switchTab = function(tabId) {
  if (!tabId) return;

  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tabContents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  if (window.ppAudio) window.ppAudio.playClick();

  // Sub-system initializations
  if (tabId === 'tab-depin' && window.piperNet) window.piperNet.init();
  if (tabId === 'tab-weissman' && window.weissmanArena) window.weissmanArena.runBenchmark('code');
  if (tabId === 'tab-studio' && window.fileStudio) window.fileStudio.init();
  if (tabId === 'tab-sdk' && window.sdkIntegration) window.sdkIntegration.init();
  if (tabId === 'tab-terminal' && window.ppTerminal) window.ppTerminal.init();
};

// Global Fail-Safe Theme Toggle (Dark -> Light -> Emerald -> Dark)
window.toggleTheme = function() {
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');

  let current = body.getAttribute('data-current-theme') || (body.classList.contains('light-theme') ? 'light' : (body.classList.contains('emerald-theme') ? 'emerald' : 'dark'));
  let newTheme = 'dark';

  if (current === 'dark') newTheme = 'light';
  else if (current === 'light') newTheme = 'emerald';
  else newTheme = 'dark';

  body.classList.remove('dark-theme', 'light-theme', 'emerald-theme');
  body.setAttribute('data-current-theme', newTheme);

  if (newTheme === 'light') {
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else if (newTheme === 'emerald') {
    body.classList.add('emerald-theme');
    if (themeIcon) themeIcon.textContent = '💎';
  } else {
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
  }

  localStorage.setItem('pp_theme', newTheme);
  if (window.ppAudio) window.ppAudio.playClick();
};

// Global Fail-Safe Sound Toggle
window.toggleSound = function() {
  const soundIcon = document.getElementById('sound-icon');
  if (window.ppAudio) {
    const isMuted = window.ppAudio.toggleMute();
    if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
  }
};

const initPiedPiperApp = () => {
  // Restore saved theme on page load
  const savedTheme = localStorage.getItem('pp_theme') || 'dark';
  const body = document.body;
  const themeIcon = document.getElementById('theme-icon');
  body.classList.remove('dark-theme', 'light-theme', 'emerald-theme');
  body.setAttribute('data-current-theme', savedTheme);

  if (savedTheme === 'light') {
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else if (savedTheme === 'emerald') {
    body.classList.add('emerald-theme');
    if (themeIcon) themeIcon.textContent = '💎';
  } else {
    body.classList.add('dark-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
  }

  // Header Logo click -> Switch to middle-out tab
  const logoBtn = document.getElementById('logo-btn');
  if (logoBtn) {
    logoBtn.onclick = (e) => {
      e.preventDefault();
      window.switchTab('tab-middle-out');
    };
  }

  // Middle-Out AI Engine Controls
  const btnRunMO = document.getElementById('btn-run-mo');
  const btnResetMO = document.getElementById('btn-reset-mo');
  const inputTextMO = document.getElementById('mo-input-text');
  const chkNeural = document.getElementById('chk-neural');
  const chkBiDir = document.getElementById('chk-bidirectional');

  if (btnRunMO && inputTextMO) {
    btnRunMO.onclick = (e) => {
      e.preventDefault();
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
    };
  }

  if (btnResetMO && inputTextMO) {
    btnResetMO.onclick = (e) => {
      e.preventDefault();
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
    };
  }

  // Preset sample loader buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  presetBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const type = btn.getAttribute('data-sample');
      let sampleText = "";
      if (type === 'json') {
        sampleText = JSON.stringify({
          app: "PiedPiper Pro",
          version: "4.2.0",
          nodes: 14892,
          algorithm: "Middle-Out Lossless",
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
        sampleText = `High-dimensional context vector token payload. Compress from 128,000 tokens down to 12,000 tokens without losing any semantic memory or lossy attention quality.`;
      } else if (type === 'hooli') {
        sampleText = `ENTERPRISE_SYSTEM_LOG: Pipeline verification successful. Middle-out compression engine achieved 3.18x compression ratio on unstructured log files with zero data loss.`;
      }

      if (inputTextMO) inputTextMO.value = sampleText;
      if (window.ppAudio) window.ppAudio.playClick();
    };
  });

  // DePIN Controls
  const btnAddNode = document.getElementById('btn-add-node');
  const btnPingAll = document.getElementById('btn-ping-all');
  const btnClearNodes = document.getElementById('btn-clear-nodes');
  const sliderTraffic = document.getElementById('slider-traffic');

  if (btnAddNode) btnAddNode.onclick = () => window.piperNet && window.piperNet.addRandomNode();
  if (btnPingAll) btnPingAll.onclick = () => window.piperNet && window.piperNet.pulsePing();
  if (btnClearNodes) btnClearNodes.onclick = () => window.piperNet && window.piperNet.seedNodes();

  if (sliderTraffic) {
    sliderTraffic.oninput = (e) => {
      const lblTraffic = document.getElementById('lbl-traffic');
      if (lblTraffic) lblTraffic.textContent = `${e.target.value}%`;
      if (window.piperNet) window.piperNet.setTrafficLoad(parseInt(e.target.value));
    };
  }

  // Weissman Arena Controls
  const btnBenchmark = document.getElementById('btn-run-benchmark');
  const selBenchmark = document.getElementById('sel-benchmark-payload');
  if (btnBenchmark && selBenchmark) {
    btnBenchmark.onclick = () => {
      if (window.weissmanArena) window.weissmanArena.runBenchmark(selBenchmark.value);
    };
  }

  // Copy MO Stream button
  const btnCopyMO = document.getElementById('btn-copy-mo');
  if (btnCopyMO) {
    btnCopyMO.onclick = () => {
      const streamText = document.getElementById('mo-output-stream').textContent;
      navigator.clipboard.writeText(streamText);
      btnCopyMO.textContent = 'Copied!';
      setTimeout(() => btnCopyMO.textContent = 'Copy Stream', 2000);
    };
  }

  // Direct File Studio Bindings
  const btnSample = document.getElementById('btn-sample-5tb');
  const btnExecute = document.getElementById('btn-send-chat-task');
  const inputFiles = document.getElementById('chat-attach-files');
  const inputFolder = document.getElementById('chat-attach-folder');

  if (inputFiles) {
    inputFiles.onchange = (e) => {
      if (window.fileStudio) window.fileStudio.handleAttachFiles(e.target.files);
      inputFiles.value = '';
    };
  }

  if (inputFolder) {
    inputFolder.onchange = (e) => {
      if (window.fileStudio) window.fileStudio.handleAttachFiles(e.target.files);
      inputFolder.value = '';
    };
  }

  if (btnSample) {
    btnSample.onclick = (e) => {
      e.preventDefault();
      if (window.fileStudio) window.fileStudio.loadSample5TBDataset();
    };
  }

  if (btnExecute) {
    btnExecute.onclick = (e) => {
      e.preventDefault();
      if (window.fileStudio) window.fileStudio.executeMultiTask();
    };
  }

  // Sub-system initializations
  if (window.fileStudio) window.fileStudio.init();
  if (window.sdkIntegration) window.sdkIntegration.init();
  if (window.ppTerminal) window.ppTerminal.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPiedPiperApp);
} else {
  initPiedPiperApp();
}
