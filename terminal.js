/* ==========================================================================
   PIED PIPER PRO - INTERACTIVE CLI TERMINAL (pp-cli v4.2)
   ========================================================================== */

class PiedPiperTerminal {
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
          this.executeCommand(commandLine);
          els.input.value = '';
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
        this.printLine(`Available Commands:`, 'accent-green');
        this.printLine(`  <strong class="accent-yellow">compress &lt;text&gt;</strong>      - Run compression engine on text payload`);
        this.printLine(`  <strong class="accent-yellow">status</strong>               - View engine and network health status`);
        this.printLine(`  <strong class="accent-yellow">stats</strong>                - View system throughput metrics and memory usage`);
        this.printLine(`  <strong class="accent-yellow">hash &lt;text&gt;</strong>        - Generate SHA-256 hash checksum`);
        this.printLine(`  <strong class="accent-yellow">clear</strong>                - Clear terminal console screen`);
        break;

      case 'compress':
        if (!args) {
          this.printLine(`Error: Usage: compress &lt;text payload&gt;`, 'accent-red');
        } else {
          const res = window.moEngine ? window.moEngine.compress(args) : { originalSize: args.length, compressedSize: Math.floor(args.length * 0.3), spaceSavedPercent: 70, weissmanScore: 5.2 };
          this.printLine(`[COMPRESSION COMPLETED] Orig: ${res.originalSize}B → Comp: ${res.compressedSize}B (${res.spaceSavedPercent}% Saved | Weissman: ${res.weissmanScore}W)`, 'accent-green');
        }
        break;

      case 'status':
        this.printLine(`Engine Status: <strong class="accent-green">Operational</strong> | Latency: 14ms | Data Loss: 0.00%`, 'accent-green');
        break;

      case 'stats':
        this.printLine(`Throughput: 3.4 GB/s | Active Buffer: 64 MB | CPU Usage: 4.2% | RAM: 128 MB`, 'accent-blue');
        break;

      case 'hash':
        if (!args) {
          this.printLine(`Error: Usage: hash &lt;text&gt;`, 'accent-red');
        } else {
          const fakeHash = Array.from(new TextEncoder().encode(args)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
          this.printLine(`SHA-256 Checksum: <strong class="accent-yellow">0x${fakeHash}</strong>`, 'accent-green');
        }
        break;

      case 'clear':
        const els = this.getElements();
        if (els.output) els.output.innerHTML = '';
        break;

      default:
        this.printLine(`Command not recognized: '${cmd}'. Type '<strong class="accent-yellow">help</strong>' for commands.`, 'accent-red');
        break;
    }
  }
}

window.ppTerminal = new PiedPiperTerminal();
