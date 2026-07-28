/* ==========================================================================
   PIED PIPER - MIDDLE-OUT AI COMPRESSION ENGINE & CANVAS VISUALIZER
   ========================================================================== */

class MiddleOutAIEngine {
  constructor() {
    this.animationId = null;
  }

  getCanvas() {
    const canvas = document.getElementById('mo-tree-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    return { canvas, ctx };
  }

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

  compress(inputText, isNeural = true, isBiDirectional = true) {
    if (!inputText || inputText.trim().length === 0) {
      return {
        originalSize: 0,
        compressedSize: 0,
        spaceSavedPercent: "0.0",
        weissmanScore: "0.00",
        compressedStream: "// Empty payload",
        entropy: "0.00"
      };
    }

    const origBytes = new TextEncoder().encode(inputText);
    const origSize = origBytes.length;

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

    let head = [];
    let tail = [];
    for (let i = 0; i < compressedCodes.length; i++) {
      if (i % 2 === 0) {
        head.push(compressedCodes[i]);
      } else {
        tail.unshift(compressedCodes[i]);
      }
    }
    const middleOutCodes = head.concat(tail);

    const neuralBonus = isNeural ? 0.35 : 0.65;
    const compressedBytesCount = Math.max(1, Math.floor(middleOutCodes.length * neuralBonus));
    const savingsPercent = Math.max(0, ((origSize - compressedBytesCount) / origSize) * 100);

    const r = origSize / compressedBytesCount;
    const r_bar = 2.0;
    const T = Math.max(0.5, compressedBytesCount * 0.005);
    const T_bar = 2.0;
    const alpha = 1.0;
    
    let weissmanScore = alpha * (r / r_bar) * (Math.log10(T_bar) / Math.log10(T + 1.01));
    if (isNaN(weissmanScore) || weissmanScore < 0) weissmanScore = 3.8;
    if (isNeural && isBiDirectional) weissmanScore += 1.4;

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

  renderTreeAnimation(inputText) {
    const { canvas, ctx } = this.getCanvas();
    if (!canvas || !ctx) return;

    if (this.animationId) cancelAnimationFrame(this.animationId);

    const overlay = document.getElementById('mo-tree-overlay');
    if (overlay) overlay.style.display = 'none';

    const width = canvas.width;
    const height = canvas.height;
    let progress = 0;

    const drawFrame = () => {
      progress += 0.04;
      if (progress > 1) progress = 1;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      const nodeCount = 18;
      const spacing = width / (nodeCount + 1);

      for (let i = 0; i < nodeCount / 2; i++) {
        const startX = spacing * (i + 1);
        const targetX = width / 2 - ((nodeCount / 2 - i) * 6);
        const currentX = startX + (targetX - startX) * progress;
        const currentY = height / 2 - Math.sin(progress * Math.PI + i) * 30;

        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(width / 2, height / 2);
        ctx.stroke();
      }

      for (let i = nodeCount / 2; i < nodeCount; i++) {
        const startX = spacing * (i + 1);
        const targetX = width / 2 + ((i - nodeCount / 2) * 6);
        const currentX = startX + (targetX - startX) * progress;
        const currentY = height / 2 + Math.sin(progress * Math.PI + i) * 30;

        ctx.fillStyle = '#00B0FF';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 176, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(width / 2, height / 2);
        ctx.stroke();
      }

      const coreRadius = 8 + progress * 10;
      ctx.fillStyle = '#7C4DFF';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();
  }
}

window.moEngine = new MiddleOutAIEngine();
