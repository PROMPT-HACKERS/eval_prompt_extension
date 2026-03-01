class RadarChart {
  constructor(canvas, size = 280) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = size;
    this.canvas.width = size;
    this.canvas.height = size;
    this.cx = size / 2;
    this.cy = size / 2;
    this.radius = size / 2 - 40;

    this.labels = [];
    this.targetFractions = new Array(NUM_AXES).fill(0.2);
    this.currentFractions = new Array(NUM_AXES).fill(0.2);
    this.overallScore = 0;
    this._animating = false;
  }

  reset() {
    this.overallScore = 0;
    for (let i = 0; i < NUM_AXES; i++) {
      this.targetFractions[i] = 0;
    }
    if (!this._animating) {
      this._animating = true;
      this._animate();
    }
  }

  update(criteria, overall, localizedLabels) {
    this.overallScore = overall;
    this.labels = localizedLabels || criteria.map(c => c.name);
    for (let i = 0; i < NUM_AXES; i++) {
      const c = criteria[i];
      if (!c) continue;
      const cfg = CRITERIA_CONFIG.criteria.find(cc => cc.name === c.name);
      if (!cfg) continue;
      const score = valueToScore(c.value, cfg);
      const pct = normalize(score, cfg);
      const clamped = Math.max(0, Math.min(100, pct));
      this.targetFractions[i] = 0.2 + (clamped / 100) * 0.8;
    }
    if (!this._animating) {
      this._animating = true;
      this._animate();
    }
  }

  _animate() {
    let needsMore = false;
    for (let i = 0; i < NUM_AXES; i++) {
      const diff = this.targetFractions[i] - this.currentFractions[i];
      if (Math.abs(diff) > 0.001) {
        this.currentFractions[i] += diff * 0.08;
        needsMore = true;
      } else {
        this.currentFractions[i] = this.targetFractions[i];
      }
    }
    this._draw();
    if (needsMore) {
      requestAnimationFrame(() => this._animate());
    } else {
      this._animating = false;
    }
  }

  _draw() {
    const { ctx, cx, cy, radius, size } = this;
    ctx.clearRect(0, 0, size, size);

    // Grid rings
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
    for (const r of rings) {
      ctx.beginPath();
      for (let i = 0; i <= NUM_AXES; i++) {
        const angle = ANGLE_OFFSET + (2 * Math.PI / NUM_AXES) * (i % NUM_AXES);
        const x = cx + Math.cos(angle) * radius * r;
        const y = cy + Math.sin(angle) * radius * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines
    for (let i = 0; i < NUM_AXES; i++) {
      const angle = ANGLE_OFFSET + (2 * Math.PI / NUM_AXES) * i;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Score polygon
    ctx.beginPath();
    for (let i = 0; i <= NUM_AXES; i++) {
      const idx = i % NUM_AXES;
      const angle = ANGLE_OFFSET + (2 * Math.PI / NUM_AXES) * idx;
      const frac = this.currentFractions[idx];
      const x = cx + Math.cos(angle) * radius * frac;
      const y = cy + Math.sin(angle) * radius * frac;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(137, 180, 250, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(137, 180, 250, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertex dots
    for (let i = 0; i < NUM_AXES; i++) {
      const angle = ANGLE_OFFSET + (2 * Math.PI / NUM_AXES) * i;
      const frac = this.currentFractions[i];
      const x = cx + Math.cos(angle) * radius * frac;
      const y = cy + Math.sin(angle) * radius * frac;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
    }

    // Axis labels
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < NUM_AXES; i++) {
      const angle = ANGLE_OFFSET + (2 * Math.PI / NUM_AXES) * i;
      const labelR = radius + 24;
      const x = cx + Math.cos(angle) * labelR;
      const y = cy + Math.sin(angle) * labelR;
      const label = this.labels[i] || '';
      // Wrap long labels
      const words = label.split(' ');
      if (words.length > 1 && label.length > 10) {
        const mid = Math.ceil(words.length / 2);
        ctx.fillText(words.slice(0, mid).join(' '), x, y - 6);
        ctx.fillText(words.slice(mid).join(' '), x, y + 6);
      } else {
        ctx.fillText(label, x, y);
      }
    }

    // Overall score in center (hide when 0)
    if (this.overallScore > 0) {
      ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = scoreColor(this.overallScore);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.overallScore, cx, cy);
    }
  }
}
