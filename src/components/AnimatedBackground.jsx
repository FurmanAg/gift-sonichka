import { useEffect, useRef } from "react";

const COLORS = ["#ff4c98", "#ff83bb", "#bc5dff", "#ffd1e5"];

function drawTinyHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.28);
  ctx.bezierCurveTo(
    x - size * 0.72,
    y - size * 0.38,
    x - size,
    y + size * 0.5,
    x,
    y + size,
  );
  ctx.bezierCurveTo(
    x + size,
    y + size * 0.5,
    x + size * 0.72,
    y - size * 0.38,
    x,
    y + size * 0.28,
  );
  ctx.fill();
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = 0;
    let height = 0;
    let particles = [];
    let frameId = 0;
    let previousTime = 0;

    const makeParticles = () => {
      const count = reducedMotion ? 18 : width < 640 ? 26 : 46;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.65 + 0.55,
        opacity: Math.random() * 0.36 + 0.1,
        speedX: (Math.random() - 0.5) * 0.11,
        speedY: -(Math.random() * 0.19 + 0.04),
        phase: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        heart: Math.random() > 0.78,
      }));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeParticles();
    };

    const render = (time) => {
      const delta = Math.min(32, time - previousTime || 16.67);
      previousTime = time;
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        const drift = reducedMotion
          ? 0
          : Math.sin(time * 0.00045 + particle.phase) * 0.14;
        particle.x += (particle.speedX + drift) * delta;
        particle.y += particle.speedY * delta;
        if (particle.y < -18) {
          particle.y = height + 18;
          particle.x = Math.random() * width;
        }
        if (particle.x < -20) particle.x = width + 18;
        if (particle.x > width + 20) particle.x = -18;

        ctx.save();
        ctx.globalAlpha =
          particle.opacity *
          (0.72 + Math.sin(time * 0.001 + particle.phase) * 0.28);
        ctx.fillStyle = particle.color;
        if (particle.heart) {
          drawTinyHeart(ctx, particle.x, particle.y, particle.radius * 2.8);
        } else {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (!reducedMotion) frameId = requestAnimationFrame(render);
    };

    const updateMotion = () => {
      reducedMotion = motionQuery.matches;
      cancelAnimationFrame(frameId);
      resize();
      previousTime = performance.now();
      render(previousTime);
    };

    resize();
    render(performance.now());
    window.addEventListener("resize", resize, { passive: true });
    motionQuery.addEventListener?.("change", updateMotion);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener?.("change", updateMotion);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="background-canvas" aria-hidden="true" />
  );
}
