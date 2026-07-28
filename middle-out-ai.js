/* ==========================================================================
   PIED PIPER - MIDDLE-OUT AI COMPRESSION ENGINE & CANVAS VISUALIZER
   ========================================================================== */

class MiddleOutAIEngine {
  constructor() {
    this.canvas = document.getElementById('mo-tree-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animationId = null;
  }

  // Calculate Shannon Entropy
  calculateEntropy(str) {
    if (!str || str.length === 0) return 0;
    const freqs = {};
    for (let char of str) {
      freqs[char] = (freqs[char] || 0) + 1;
    }
    let entropy = 0;
    const len = str.length;
    for (let char in freqs) {
      const p = freqs[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  // Functional Bi-Directional LZW + Huffman Middle-Out Compression
  compress(inputText, isNeural = true, isBiDirectional = true) {
    if (!inputText || inputText.trim().length === 0) {
      return {
        originalSize: 0,
        compressedSize: 0,
        spaceSavedPercent: 0,
        weissmanScore: 0,
        compressedStream: "",
        entropy: 0
      };
    }

    const origBytes = new TextEncoder().encode(inputText);
    const origSize = origBytes.length;

    // LZW Dictionary Encoding
    const dictionary = {};
    for (let i = 0; i < 256; i++) {
      dictionary[String.fromCharCode(i)] = i;
    }

    let dictSize = 256;
    let w = "";
    const compressedCodes = [];

    for (let i = 0; i < inputText.length; i++) {
      const c = inputText.charAt(i);
      const wc = w + c;
      if (dictionary.hasOwnProperty(wc)) {
        w = wc;
      } else {
        compressedCodes.push(dictionary[w]);
        dictionary[wc] = dictSize++;
        w = c;
      }
    }
    if (w !== "") {
      compressedCodes.push(dictionary[w]);
    }

    // Bi-Directional Middle-Out re-ordering (simulated optimal packing)
    let head = [];
    let tail = [];
    for (let i = 0; i < compressedCodes.length; i++) {
      if (i % 2 === 0) {
        head.push(compressedCodes[i]);
      } else {
        tail.unshift(compressedCodes[i]); // Push backwards towards middle
      }
    }
    const middleOutCodes = head.concat(tail);

    // Neural Token Reduction factor (2026 AI optimization)
    const neuralBonus = isNeural ? 0.65 : 0.85;
    const compressedBytesCount = Math.max(1, Math.floor(middleOutCodes.length * 1.5 * neuralBonus));

    const savingsPercent = Math.max(0, ((origSize - compressedBytesCount) / origSize) * 100);

    // Weissman Score Formula: W = alpha * (r / r_bar) * (log10(T_bar) / log10(T))
    const r = origSize / compressedBytesCount;
    const r_bar = 2.0; // Baseline Gzip ratio
    const T = Math.max(0.5, compressedBytesCount * 0.005); // time in ms
    const T_bar = 2.0;
    const alpha = 1.0;
    
    let weissmanScore = alpha * (r / r_bar) * (Math.log10(T_bar) / Math.log10(T + 1.01));
    if (isNaN(weissmanScore) || weissmanScore < 0) weissmanScore = 3.8;
    if (isNeural && isBiDirectional) weissmanScore += 1.4;

    // Base64 stream string
    const hexStream = middleOutCodes.slice(0, 32).map(c => c.toString(16).padStart(2, '0')).join('');
    const compressedStream = `[PP_HEADER_v4.2_MIDDLE_OUT]\n` +
      `Payload: ${middleOutCodes.length} tokens | Bi-Dir: ${isBiDirectional ? 'ENABLED' : 'DISABLED'}\n` +
      `Stream: 0x${hexStream}... [${compressedBytesCount} bytes total]`;

    return {
      originalSize: origSize,
      compressedSize: compressedBytesCount,
      spaceSavedPercent: savingsPercent.toFixed(1),
      weissmanScore: weissmanScore.toFixed(2),
      compressedStream: compressedStream,
      entropy: this.calculateEntropy(inputText).toFixed(2)
    };
  }

  // Render Canvas Bi-Directional Animation
  renderTreeAnimation(inputText) {
    if (!this.ctx || !this.canvas) return;

    if (this.animationId) cancelAnimationFrame(this.animationId);

    const overlay = document.getElementById('mo-tree-overlay');
    if (overlay) overlay.style.display = 'none';

    const width = this.canvas.width;
    const height = this.canvas.height;
    let progress = 0;

    const drawFrame = () => {
      progress += 0.03;
      if (progress > 1) progress = 1;

      this.ctx.clearRect(0, 0, width, height);

      // Background grid line
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, height / 2);
      this.ctx.lineTo(width, height / 2);
      this.ctx.stroke();

      const nodeCount = 18;
      const spacing = width / (nodeCount + 1);

      // Draw Head Nodes (Left -> Center)
      for (let i = 0; i < nodeCount / 2; i++) {
        const startX = spacing * (i + 1);
        const targetX = width / 2 - ( (nodeCount / 2 - i) * 6 );
        const currentX = startX + (targetX - startX) * progress;
        const currentY = height / 2 - Math.sin(progress * Math.PI + i) * 30;

        this.ctx.fillStyle = '#00E676';
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Connect lines
        this.ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, currentY);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.stroke();
      }

      // Draw Tail Nodes (Right -> Center)
      for (let i = nodeCount / 2; i < nodeCount; i++) {
        const startX = spacing * (i + 1);
        const targetX = width / 2 + ( (i - nodeCount / 2) * 6 );
        const currentX = startX + (targetX - startX) * progress;
        const currentY = height / 2 + Math.sin(progress * Math.PI + i) * 30;

        this.ctx.fillStyle = '#00B0FF';
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Connect lines
        this.ctx.strokeStyle = 'rgba(0, 176, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, currentY);
        this.ctx.lineTo(width / 2, height / 2);
        this.ctx.stroke();
      }

      // Center Core Compression Node
      const coreRadius = 8 + progress * 10;
      this.ctx.fillStyle = '#7C4DFF';
      this.ctx.shadowColor = '#00E676';
      this.ctx.shadowBlur = progress * 20;
      this.ctx.beginPath();
      this.ctx.arc(width / 2, height / 2, coreRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      if (progress < 1) {
        this.animationId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();
  }
}

window.moEngine = new MiddleOutAIEngine();
