// Web Audio API Synthesizer & Canvas Confetti (100% Free Tier, Zero Dependencies)

/**
 * Synthesizes a melodic victory/success chime using browser Web Audio API.
 * Requires 0 external audio files, works offline, instant playback.
 */
export function playSuccessChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Melodic celebration arpeggio: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.5Hz)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.12, duration: 0.15 },
      { freq: 783.99, time: 0.24, duration: 0.2 },
      { freq: 1046.5, time: 0.38, duration: 0.45 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm, clear, bell-like timbre
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Smooth attack and release envelope
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });

    // Close context after completion
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch (err) {
    console.debug('Web Audio celebration not supported or blocked:', err);
  }
}

/**
 * Triggers a burst of vibrant confetti across the screen using HTML5 Canvas.
 * Automatically cleans up DOM and memory when complete.
 */
export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.id = 'order-celebration-confetti';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const colors = [
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // rose
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#fbbf24', // gold
  ];

  interface Particle {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle';
  }

  const particleCount = Math.min(140, Math.floor(width / 8));
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    // Burst from bottom-center or two fountain sides
    const startX = width * 0.5 + (Math.random() - 0.5) * 200;
    const startY = height * 0.7;

    particles.push({
      x: startX,
      y: startY,
      w: Math.random() * 10 + 6,
      h: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: -(Math.random() * 14 + 10),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  const gravity = 0.35;
  const drag = 0.985;
  let animationFrameId: number;
  const startTime = Date.now();

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const elapsed = Date.now() - startTime;
    let aliveCount = 0;

    for (const p of particles) {
      p.vx *= drag;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // Start fading out after 1.8s
      if (elapsed > 1800) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      if (p.y < height && p.opacity > 0) {
        aliveCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    if (aliveCount > 0 && elapsed < 4000) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
    }
  }

  animate();
}
