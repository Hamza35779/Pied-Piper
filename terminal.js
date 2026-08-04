/* ==========================================================================
   PIEDPIPER PRO - ADVANCED CLI TERMINAL ENGINE (pp-cli v4.2)
   ========================================================================== */

class PiedPiperTerminal {
  constructor() {
    this.history = [];
    this.commandsList = [
      'help', 'goto', 'theme', 'compress', 'sample', 'process', 'tree',
      'hash', 'benchmark', 'nodes', 'status', 'sysinfo', 'history', 'clear',
      'hotdog', 'tabs', 'russ', 'jian-yang', 'jin-yang', 'erlich', 'delete', 'aviato'
    ];
  }

  getElements() {
    return {
      output: document.getElementById('term-output'),
      input: document.getElementById('term-input')
    };
  }

  init() {
    const els = this.getElements();
    if (!els.input) return;

    els.input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const commandLine = els.input.value.trim();
        if (commandLine) {
          this.history.push(commandLine);
          this.historyIndex = this.history.length;
          this.executeCommand(commandLine);
          els.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.history.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          els.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          els.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          els.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = els.input.value.trim().toLowerCase();
        if (current) {
          const match = this.commandsList.find(c => c.startsWith(current));
          if (match) els.input.value = match + ' ';
        }
      }
    };
  }

  printLine(text, className = '') {
    const els = this.getElements();
    if (!els.output) return;
    const div = document.createElement('div');
    div.className = `term-line ${className}`;
    div.innerHTML = text;
    els.output.appendChild(div);
    els.output.scrollTop = els.output.scrollHeight;
  }

  executeCommand(cmdStr) {
    this.printLine(`<span class="term-prompt">piedpiper@pro:~$</span> ${cmdStr}`);

    const parts = cmdStr.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (window.ppAudio) window.ppAudio.playClick();

    switch (cmd) {
      case 'help':
        this.printLine(`📜 PiedPiper Pro CLI Command Reference:`, 'accent-green');
        this.printLine(`  <strong class="accent-yellow">goto &lt;studio|engine|nodes|benchmark|sdk|terminal&gt;</strong> - Switch UI tab`);
        this.printLine(`  <strong class="accent-yellow">theme &lt;dark|light|emerald&gt;</strong>                     - Switch UI color theme`);
        this.printLine(`  <strong class="accent-yellow">compress &lt;text&gt;</strong>                                  - Run Middle-Out compression on text`);
        this.printLine(`  <strong class="accent-yellow">sample</strong>                                           - Load sample dataset into File Studio`);
        this.printLine(`  <strong class="accent-yellow">process</strong>                                          - Execute file studio multi-task pipeline`);
        this.printLine(`  <strong class="accent-yellow">tree</strong>                                             - Render ASCII folder directory tree`);
        this.printLine(`  <strong class="accent-yellow">benchmark &lt;code|json|media&gt;</strong>                      - Run Weissman benchmark suite`);
        this.printLine(`  <strong class="accent-yellow">nodes &lt;status|add|ping|reset&gt;</strong>                    - Manage P2P network nodes`);
        this.printLine(`  <strong class="accent-yellow">hash &lt;text&gt;</strong>                                      - Compute SHA-256 checksum hash`);
        this.printLine(`  <strong class="accent-yellow">status / sysinfo</strong>                                 - Display system specs & status`);
        this.printLine(`  <strong class="accent-yellow">history</strong>                                          - List command execution history`);
        this.printLine(`  <strong class="accent-yellow">clear</strong>                                            - Clear console screen`);
        break;

      case 'goto':
        if (!args) {
          this.printLine(`Usage: goto &lt;studio|engine|nodes|benchmark|sdk|terminal&gt;`, 'accent-red');
        } else {
          const tabMap = {
            'studio': 'tab-studio',
            'engine': 'tab-middle-out',
            'nodes': 'tab-depin',
            'benchmark': 'tab-weissman',
            'sdk': 'tab-sdk',
            'terminal': 'tab-terminal'
          };
          const target = tabMap[args.toLowerCase()];
          if (target && window.switchTab) {
            window.switchTab(target);
            this.printLine(`[NAVIGATION] Switched tab to '${args}'.`, 'accent-green');
          } else {
            this.printLine(`Unknown tab '${args}'. Available: studio, engine, nodes, benchmark, sdk, terminal.`, 'accent-red');
          }
        }
        break;

      case 'theme':
        if (!args) {
          this.printLine(`Usage: theme &lt;dark|light|emerald&gt;`, 'accent-red');
        } else {
          const themeName = args.toLowerCase();
          const body = document.body;
          const themeIcon = document.getElementById('theme-icon');
          body.classList.remove('dark-theme', 'light-theme', 'emerald-theme');
          body.setAttribute('data-current-theme', themeName);

          if (themeName === 'light') {
            body.classList.add('light-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
          } else if (themeName === 'emerald') {
            body.classList.add('emerald-theme');
            if (themeIcon) themeIcon.textContent = '💎';
          } else {
            body.classList.add('dark-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
          }
          localStorage.setItem('pp_theme', themeName);
          this.printLine(`[THEME] Switched UI theme to '${themeName}'.`, 'accent-green');
        }
        break;

      case 'compress':
        if (!args) {
          this.printLine(`Error: Usage: compress &lt;text payload&gt;`, 'accent-red');
        } else {
          const res = window.moEngine ? window.moEngine.compress(args) : { originalSize: args.length, compressedSize: Math.floor(args.length * 0.3), spaceSavedPercent: 70, weissmanScore: 5.2 };
          this.printLine(`[MIDDLE-OUT ENGINE] Compressed ${res.originalSize}B → ${res.compressedSize}B (${res.spaceSavedPercent}% Saved | Weissman: ${res.weissmanScore}W)`, 'accent-green');
        }
        break;

      case 'sample':
        if (window.fileStudio) {
          window.fileStudio.loadSample5TBDataset();
          this.printLine(`[FILE STUDIO] Sample dataset loaded into attachment pipeline.`, 'accent-green');
        }
        break;

      case 'process':
        if (window.fileStudio) {
          window.fileStudio.executeMultiTask();
          this.printLine(`[FILE STUDIO] Pipeline execution started.`, 'accent-green');
        }
        break;

      case 'tree':
        this.printLine(`📂 dataset_cluster/`, 'accent-yellow');
        this.printLine(`├── 🎬 raw_master_footage.mp4 (2.2 TB) [Compressed: 710 GB]`, 'accent-green');
        this.printLine(`├── ⚙️ genomics_dna_dataset.bin (1.6 TB) [Compressed: 520 GB]`, 'accent-green');
        this.printLine(`├── 📄 node_database.sql (1.1 TB) [Compressed: 340 GB]`, 'accent-green');
        this.printLine(`└── ⚙️ model_weights.json (550 GB) [Compressed: 170 GB]`, 'accent-green');
        this.printLine(`4 files, 1 directory | 0.00% Quality Loss`, 'accent-blue');
        break;

      case 'benchmark':
        const type = args || 'code';
        if (window.weissmanArena) {
          window.weissmanArena.runBenchmark(type);
          this.printLine(`[BENCHMARK] Executed benchmark suite for payload '${type}'. Check Benchmark Suite tab for full charts.`, 'accent-purple');
        }
        break;

      case 'nodes':
        const sub = args.toLowerCase();
        if (sub === 'add' && window.piperNet) {
          window.piperNet.addRandomNode();
          this.printLine(`[DEPIN] Spawned new node into network map.`, 'accent-green');
        } else if (sub === 'ping' && window.piperNet) {
          window.piperNet.pulsePing();
          this.printLine(`[DEPIN] Broadcasted ping pulses across all active nodes.`, 'accent-green');
        } else if (sub === 'reset' && window.piperNet) {
          window.piperNet.seedNodes();
          this.printLine(`[DEPIN] Topology map reset to initial seed state.`, 'accent-yellow');
        } else {
          this.printLine(`PipedPiper DePIN: 14,892 Active Nodes | 5.2 PB Storage | 42,100 TFLOPS Compute`, 'accent-blue');
        }
        break;

      case 'hash':
        if (!args) {
          this.printLine(`Usage: hash &lt;text payload&gt;`, 'accent-red');
        } else {
          const bytes = new TextEncoder().encode(args);
          let hashVal = 0;
          for (let b of bytes) hashVal = (hashVal * 31 + b) % 4294967296;
          const hex = hashVal.toString(16).padStart(8, '0');
          this.printLine(`Adler32 / SHA-256 Checksum: <strong class="accent-yellow">0x${hex}9a4b2c1f...</strong>`, 'accent-green');
        }
        break;

      case 'status':
      case 'sysinfo':
        this.printLine(`📊 PiedPiper Pro System Information:`, 'accent-green');
        this.printLine(`  • Version: <strong class="accent-yellow">v4.2.0-release (x86_64)</strong>`);
        this.printLine(`  • Engine: <strong class="accent-yellow">Bi-Directional Middle-Out Neural Engine</strong>`);
        this.printLine(`  • Average Weissman Score: <strong class="accent-yellow">5.84 W</strong>`);
        this.printLine(`  • Throughput Speed: <strong class="accent-yellow">3.4 GB/s Multi-Threaded</strong>`);
        this.printLine(`  • Data Integrity: <strong class="accent-yellow">100.00% (Zero Data Loss)</strong>`);
        this.printLine(`  • Network P2P Compute: <strong class="accent-yellow">42,100 TFLOPS</strong>`);
        break;

      case 'history':
        this.printLine(`Command Execution History:`, 'accent-yellow');
        this.history.forEach((h, idx) => {
          this.printLine(`  ${idx + 1}. ${h}`);
        });
        break;

      case 'hotdog':
        this.printLine(`🌭 JIAN-YANG'S HOTDOG CLASSIFIER v1.0`, 'accent-yellow');
        this.printLine(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        this.printLine(`"See food? Hot dog. Not see food? Not hot dog."`);
        this.printLine(`Classifying current session data...`);
        this.printLine(`Result: 🌭 HOTDOG (98.7% confidence)`, 'accent-green');
        this.printLine(`"Erlich, is your refrigerator running? This is Mike Hunt."`);
        break;

      case 'tabs':
        this.printLine(`"Tabs. Obviously. Spaces are what Hooli developers use."`);
        this.printLine(`— Richard Hendricks, settling the eternal debate`);
        break;

      case 'russ':
        this.printLine(`🤙 "This guy fucks!" — Russ Hanneman, Tres Commas Club`);
        this.printLine(`💰 Current net worth: $986,000,000 (NOT a billionaire)`);
        this.printLine(`🚗 Car doors: ←→ (They go like THIS, not like this)`);
        break;

      case 'jian-yang':
      case 'jin-yang':
        this.printLine(`🍳 JIAN-YANG ENTERPRISES`);
        this.printLine(`• SeeFood App: "It's a hot dog."`);
        this.printLine(`• Erlich's Palapa: ACQUIRED`);
        this.printLine(`• New Pied Piper: "It's a-my-a Pied Piper"`);
        this.printLine(`"Erlich Bachman, this is you as old man. I'm ugly and I'm dead. Alone."`);
        break;

      case 'erlich':
        this.printLine(`🎭 ERLICH BACHMAN — AVIATO FOUNDER`);
        this.printLine(`"I've been known to fuck myself."`);
        this.printLine(`"You just brought piss to a shit fight."`);
        this.printLine(`Status: Last seen in Tibet. Presumed enlightened.`);
        break;

      case 'delete':
        if (args === 'hooli') {
          this.printLine(`💀 INITIATING HOOLI SERVER PURGE...`, 'accent-red');
          this.printLine(`[████████████████████] 100%`);
          this.printLine(`All Hooli Nucleus data centers: WIPED`);
          this.printLine(`Gavin Belson has been notified.`);
          this.printLine(`"Consider the elephant..." — Gavin Belson's last words`);
        } else {
          this.printLine(`Command not recognized: 'delete ${args}'. Type '<strong class="accent-yellow">help</strong>' for available CLI commands.`, 'accent-red');
        }
        break;

      case 'aviato':
        this.printLine(`✈️ AVIATO — The Social Network for Planes`);
        this.printLine(`Founded by: Erlich Bachman`);
        this.printLine(`Status: ACQUIRED (and shut down)`);
        this.printLine(`"My Aviato? You mean Aviato? Yes, MY Aviato."`);
        break;

      case 'clear':
        const els = this.getElements();
        if (els.output) els.output.innerHTML = '';
        break;

      default:
        this.printLine(`Command not recognized: '${cmd}'. Type '<strong class="accent-yellow">help</strong>' for available CLI commands.`, 'accent-red');
        break;
    }
  }
}

window.ppTerminal = new PiedPiperTerminal();
