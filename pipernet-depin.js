/* ==========================================================================
   PIED PIPER - PIPERNET DEPIN 2D/3D CANVAS P2P NODE VISUALIZER
   ========================================================================== */

class PiperNetDePIN {
  constructor() {
    this.nodes = [];
    this.packets = [];
    this.draggedNode = null;
    this.animId = null;
    this.trafficLoad = 0.5;
    this.isInitialized = false;
  }

  getCanvas() {
    const canvas = document.getElementById('depin-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    return { canvas, ctx };
  }

  init() {
    const { canvas, ctx } = this.getCanvas();
    if (!canvas || !ctx) return;

    this.resizeCanvas();
    this.seedNodes();

    if (!this.isInitialized) {
      canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      canvas.addEventListener('mouseup', () => this.draggedNode = null);
      window.addEventListener('resize', () => this.resizeCanvas());
      this.isInitialized = true;
    }

    if (!this.animId) {
      this.startLoop();
    }
  }

  resizeCanvas() {
    const { canvas } = this.getCanvas();
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || 900;
    canvas.height = rect.height || 420;
  }

  seedNodes() {
    const { canvas } = this.getCanvas();
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    this.nodes = [
      { id: 1, type: 'master', x: w / 2, y: h / 2, radius: 14, color: '#00E676', label: 'PiedPiper Seed-01' },
      { id: 2, type: 'gpu', x: w * 0.25, y: h * 0.3, radius: 10, color: '#00B0FF', label: 'GPU Cluster US-East' },
      { id: 3, type: 'storage', x: w * 0.75, y: h * 0.35, radius: 10, color: '#7C4DFF', label: 'DePIN Storage EU-Central' },
      { id: 4, type: 'gpu', x: w * 0.7, y: h * 0.75, radius: 9, color: '#00B0FF', label: 'GPU Node Asia-Tokyo' },
      { id: 5, type: 'peer', x: w * 0.2, y: h * 0.7, radius: 7, color: '#FFD600', label: 'Mobile Peer #489' },
      { id: 6, type: 'storage', x: w * 0.5, y: h * 0.2, radius: 9, color: '#7C4DFF', label: 'Anton Server Backup' },
      { id: 7, type: 'peer', x: w * 0.4, y: h * 0.8, radius: 6, color: '#FFD600', label: 'Edge Peer #102' }
    ];
  }

  addRandomNode() {
    const { canvas } = this.getCanvas();
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const types = ['gpu', 'storage', 'peer'];
    const colors = { gpu: '#00B0FF', storage: '#7C4DFF', peer: '#FFD600' };
    const type = types[Math.floor(Math.random() * types.length)];
    const id = this.nodes.length + 1;

    const newNode = {
      id: id,
      type: type,
      x: Math.random() * (w - 100) + 50,
      y: Math.random() * (h - 100) + 50,
      radius: type === 'peer' ? 6 : 9,
      color: colors[type],
      label: `DePIN Node #${id}`
    };

    this.nodes.push(newNode);
    this.logEvent(`[DEPIN] Added new ${type.toUpperCase()} Node #${id}`);
  }

  pulsePing() {
    const master = this.nodes.find(n => n.type === 'master');
    if (!master) return;

    this.nodes.forEach(node => {
      if (node !== master) {
        this.packets.push({
          startX: master.x,
          startY: master.y,
          endX: node.x,
          endY: node.y,
          progress: 0,
          speed: 0.02 + Math.random() * 0.02,
          color: '#00E676'
        });
      }
    });

    if (window.ppAudio) window.ppAudio.playNodePulse();
    this.logEvent(`[PULSE] Broadcasted ping challenge across ${this.nodes.length} nodes.`);
  }

  setTrafficLoad(valPercent) {
    this.trafficLoad = valPercent / 100;
  }

  handleMouseDown(e) {
    const { canvas } = this.getCanvas();
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let node of this.nodes) {
      const dist = Math.hypot(node.x - mx, node.y - my);
      if (dist < node.radius + 6) {
        this.draggedNode = node;
        break;
      }
    }
  }

  handleMouseMove(e) {
    if (!this.draggedNode) return;
    const { canvas } = this.getCanvas();
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.draggedNode.x = e.clientX - rect.left;
    this.draggedNode.y = e.clientY - rect.top;
  }

  logEvent(msg) {
    const logBox = document.getElementById('depin-log');
    if (logBox) {
      const div = document.createElement('div');
      div.className = 'log-line';
      div.textContent = msg;
      logBox.appendChild(div);
      logBox.scrollTop = logBox.scrollHeight;
    }
  }

  startLoop() {
    const draw = () => {
      const { canvas, ctx } = this.getCanvas();
      if (!canvas || !ctx) {
        this.animId = requestAnimationFrame(draw);
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (Math.random() < this.trafficLoad * 0.1 && this.nodes.length > 1) {
        const n1 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        const n2 = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        if (n1 !== n2) {
          this.packets.push({
            startX: n1.x,
            startY: n1.y,
            endX: n2.x,
            endY: n2.y,
            progress: 0,
            speed: 0.015 + Math.random() * 0.03,
            color: n1.color
          });
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const n1 = this.nodes[i];
          const n2 = this.nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 260) {
            const alpha = (1 - dist / 260) * 0.25;
            ctx.strokeStyle = `rgba(0, 230, 118, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      for (let i = this.packets.length - 1; i >= 0; i--) {
        const p = this.packets[i];
        p.progress += p.speed;

        const currX = p.startX + (p.endX - p.startX) * p.progress;
        const currY = p.startY + (p.endY - p.startY) * p.progress;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(currX, currY, 3, 0, Math.PI * 2);
        ctx.fill();

        if (p.progress >= 1) {
          this.packets.splice(i, 1);
        }
      }

      this.nodes.forEach(node => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px "Fira Code", monospace';
        ctx.fillText(node.label, node.x + node.radius + 6, node.y + 3);
      });

      this.animId = requestAnimationFrame(draw);
    };

    draw();
  }
}

window.piperNet = new PiperNetDePIN();
