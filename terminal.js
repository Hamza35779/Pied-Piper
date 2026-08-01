/* ==========================================================================
   PIED PIPER - INTERACTIVE CLI TERMINAL (pp-cli v4.2)
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
        this.printLine(`  <strong class="accent-yellow">hooli-hack</strong>           - Intercept Gavin Belson's Hooli Nucleus logs`);
        this.printLine(`  <strong class="accent-yellow">matrix</strong>               - Stream green Middle-Out byte matrix`);
        this.printLine(`  <strong class="accent-yellow">gilfoyle-screamer</strong>    - Play Anton server alert chime`);
        this.printLine(`  <strong class="accent-yellow">clear</strong>                - Clear terminal console screen`);
        break;

      case 'compress':
        if (!args) {
          this.printLine(`Error: Usage: compress &lt;text payload&gt;`, 'accent-red');
        } else {
          const res = window.moEngine ? window.moEngine.compress(args) : { originalSize: args.length, compressedSize: Math.floor(args.length * 0.3), spaceSavedPercent: 70, weissmanScore: 5.2 };
          this.printLine(`[MIDDLE-OUT COMPLETED] Orig: ${res.originalSize}B → Comp: ${res.compressedSize}B (${res.spaceSavedPercent}% Saved | Weissman: ${res.weissmanScore}W)`, 'accent-green');
        }
        break;

      case 'weissman':
        this.printLine(`Current System Weissman Score: <strong class="accent-purple">5.84 W</strong> (Hooli Baseline: 1.00 W)`, 'accent-green');
        break;

      case 'depin':
        if (args === 'status' || !args) {
          this.printLine(`DePIN Network: <strong class="accent-green">14,892 Nodes Online</strong> | Storage: 5.2 PB | P2P Compute: 42,100 TFLOPS`, 'accent-blue');
        }
        break;

      case 'nodes':
        if (args === 'add') {
          if (window.piperNet) window.piperNet.addRandomNode();
          this.printLine(`[NODE] Spawned new P2P peer node into network.`, 'accent-green');
        }
        break;

      case 'hooli-hack':
        this.printLine(`[INTERCEPT] Gavin Belson Audio Log: "Nucleus is a disaster! How are they achieving 5.8 Weissman score?!"`, 'accent-red');
        break;

      case 'matrix':
        this.printLine(`01001000 01100001 01110010 01110110 01100001 01110010 01100100 00100000 01000011 01101111 01101101 01110000 01110010 01100101 01110011 01110011 01110011`, 'accent-green');
        break;

      case 'gilfoyle-screamer':
        if (window.ppAudio) window.ppAudio.playNodePulse();
        this.printLine(`[ALARM] Anton Server screaming alert activated!`, 'accent-yellow');
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
