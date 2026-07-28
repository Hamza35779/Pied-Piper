/* ==========================================================================
   PIED PIPER - INTERACTIVE CLI TERMINAL (pp-cli v4.2)
   ========================================================================== */

class PiedPiperTerminal {
  constructor() {
    this.output = document.getElementById('term-output');
    this.input = document.getElementById('term-input');
    this.init();
  }

  init() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const commandLine = this.input.value.trim();
        if (commandLine) {
          this.executeCommand(commandLine);
          this.input.value = '';
        }
      }
    });
  }

  printLine(text, className = '') {
    if (!this.output) return;
    const div = document.createElement('div');
    div.className = `term-line ${className}`;
    div.innerHTML = text;
    this.output.appendChild(div);
    this.output.scrollTop = this.output.scrollHeight;
  }

  executeCommand(cmdStr) {
    this.printLine(`<span class="term-prompt">piedpiper@anton:~$</span> ${cmdStr}`);

    const parts = cmdStr.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (window.ppAudio) window.ppAudio.playClick();

    switch (cmd) {
      case 'help':
        this.printLine(`Available Commands:`, 'accent-green');
        this.printLine(`  <strong class="accent-yellow">compress &lt;text&gt;</strong>      - Run Middle-Out AI compression on text`);
        this.printLine(`  <strong class="accent-yellow">weissman</strong>             - Calculate current system Weissman score`);
        this.printLine(`  <strong class="accent-yellow">depin status</strong>         - View active DePIN P2P nodes and storage pool`);
        this.printLine(`  <strong class="accent-yellow">nodes add</strong>            - Spawn new peer node on network`);
        this.printLine(`  <strong class="accent-yellow">hooli-hack</strong>           - Simulate Hooli Nucleus stress test breakdown`);
        this.printLine(`  <strong class="accent-yellow">gilfoyle-screamer</strong>    - Run Gilfoyle system security audit`);
        this.printLine(`  <strong class="accent-yellow">matrix</strong>               - Render binary stream matrix effect`);
        this.printLine(`  <strong class="accent-yellow">clear</strong>                - Clear terminal log`);
        break;

      case 'compress':
        if (!args) {
          this.printLine(`Usage: compress <text string to compress>`, 'accent-red');
        } else {
          const res = window.moEngine ? window.moEngine.compress(args) : { weissmanScore: 5.2, spaceSavedPercent: 64 };
          this.printLine(`[MIDDLE-OUT] Input Bytes: ${args.length} B -> Output Bytes: ${res.compressedSize} B`);
          this.printLine(`[MIDDLE-OUT] Space Saved: <strong class="accent-green">${res.spaceSavedPercent}%</strong> | Weissman Score: <strong class="accent-purple">${res.weissmanScore} W</strong>`);
          if (window.ppAudio) window.ppAudio.playCompressionSweep();
        }
        break;

      case 'weissman':
        this.printLine(`Current Weissman Benchmark: <strong class="accent-green">5.28 W</strong> (Baseline Gzip = 1.00 W)`);
        this.printLine(`Hooli Nucleus Score: <span class="accent-red">1.42 W (Inferior)</span>`);
        break;

      case 'depin':
        if (args.toLowerCase() === 'status') {
          this.printLine(`[DEPIN] Active Nodes: 14,892 | Total Storage: 84.2 PB | Health: 100%`);
          this.printLine(`[DEPIN] Proof of Replication: 99.98% Passed`);
        } else {
          this.printLine(`Usage: depin status`);
        }
        break;

      case 'nodes':
        if (args.toLowerCase() === 'add') {
          if (window.piperNet) window.piperNet.addRandomNode();
          this.printLine(`[NODE] Successfully registered and connected new node to PiperNet P2P grid.`, 'accent-green');
        } else {
          this.printLine(`Usage: nodes add`);
        }
        break;

      case 'hooli-hack':
        this.printLine(`[HOOLI] Intercepting Hooli Nucleus 2.0 compression payload...`);
        setTimeout(() => this.printLine(`[HOOLI] Hooli server memory leak detected! Code base failing!`, 'accent-red'), 500);
        setTimeout(() => this.printLine(`[PIED PIPER] Middle-Out taking over stream bandwidth cleanly. Weissman Score boosted!`, 'accent-green'), 1000);
        break;

      case 'gilfoyle-screamer':
        this.printLine(`[GILFOYLE] Running system security audit...`, 'accent-purple');
        this.printLine(`[ANTON] Firewalls active. 0 vulnerabilities found. Satanic encryption key verified.`, 'accent-green');
        break;

      case 'matrix':
        this.printLine(`01001000 01101111 01101111 01101100 01101001 00100000 01010011 01110101 01100011 01101011 01110011`, 'accent-green');
        this.printLine(`01010000 01101001 01100101 01000100 00100000 01010000 01101001 01110000 01100101 01110010`, 'accent-green');
        break;

      case 'clear':
        if (this.output) this.output.innerHTML = '';
        break;

      default:
        this.printLine(`Command not recognized: '${cmd}'. Type 'help' for available commands.`, 'accent-red');
        break;
    }
  }
}

window.ppTerminal = new PiedPiperTerminal();
