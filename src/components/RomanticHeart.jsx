import { useEffect, useRef } from "react";

const COLORS = ["#ff2c82", "#ff5ba5", "#ff8fc4", "#ffc4dc", "#d94dff"];
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const easeOut = (value) => 1 - (1 - value) ** 3;

function heartPoint(t) {
  return {
    x: 16 * Math.sin(t) ** 3,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  };
}

export default function RomanticHeart({ text = "Te Amo" }) {
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
    let animationFrameId = 0;
    let startedAt = performance.now();

    const createParticle = (targetX, targetY, options = {}) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      originX: targetX,
      originY: targetY,
      size: options.size ?? 1.5,
      color: options.color ?? COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: options.delay ?? Math.random() * 800,
      text: options.text ?? false,
      phase: Math.random() * Math.PI * 2,
      drift: options.text ? 0.35 : Math.random() * 5 + 0.5,
      escape: options.text ? 0 : Math.random() < 0.12 ? Math.random() * 13 + 6 : 0,
    });

    const makeTextParticles = (centerX, textY, fontSize) => {
      const sample = document.createElement("canvas");
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      if (!sampleCtx) return [];
      const font = `600 italic ${fontSize}px Georgia, 'Times New Roman', serif`;
      sampleCtx.font = font;
      sample.width = Math.ceil(sampleCtx.measureText(text).width + 24);
      sample.height = Math.ceil(fontSize * 1.45);
      sampleCtx.font = font;
      sampleCtx.fillStyle = "#fff";
      sampleCtx.textBaseline = "middle";
      sampleCtx.fillText(text, 12, sample.height / 2 + fontSize * 0.03);
      const pixels = sampleCtx.getImageData(0, 0, sample.width, sample.height).data;
      const step = width < 640 ? 3 : 2;
      const result = [];

      for (let y = 0; y < sample.height; y += step) {
        for (let x = 0; x < sample.width; x += step) {
          if (pixels[(y * sample.width + x) * 4 + 3] > 170) {
            result.push(createParticle(centerX - sample.width / 2 + x, textY - sample.height / 2 + y, {
              size: Math.random() * 1.15 + 0.65,
              color: ["#fff6fb", "#ffd1e5", "#ff62aa"][Math.floor(Math.random() * 3)],
              delay: 1600 + Math.random() * 850,
              text: true,
            }));
          }
        }
      }
      return result;
    };

    const initialise = () => {
      particles = [];
      const centerX = width / 2;
      const centerY = height * 0.425;
      const scale = Math.min(width, height * 0.74) / 41;
      const outlineCount = width < 640 ? 310 : 470;
      const innerCount = width < 640 ? 280 : 440;

      for (let index = 0; index < outlineCount; index += 1) {
        const point = heartPoint((index / outlineCount) * Math.PI * 2);
        particles.push(createParticle(centerX + point.x * scale, centerY + point.y * scale, {
          size: Math.random() * 1.25 + 1.1,
          delay: Math.random() * 920,
        }));
      }
      for (let index = 0; index < innerCount; index += 1) {
        const point = heartPoint(Math.random() * Math.PI * 2);
        const depth = Math.sqrt(Math.random()) * 0.9;
        particles.push(createParticle(centerX + point.x * scale * depth, centerY + point.y * scale * depth, {
          size: Math.random() * 1.2 + 0.55,
          delay: 250 + Math.random() * 1000,
        }));
      }
      particles.push(...makeTextParticles(centerX, centerY + scale * 20.3 + 24, clamp(width / 11.5, 36, 66)));
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
      initialise();
      startedAt = performance.now();
    };

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);
      const elapsed = reducedMotion ? 5000 : time - startedAt;
      const pulse = 1 + Math.sin(time * 0.0031) * 0.025 + Math.max(0, Math.sin(time * 0.0062)) * 0.018;
      const centerX = width / 2;
      const centerY = height * 0.425;

      for (const particle of particles) {
        const appear = easeOut(clamp((elapsed - particle.delay) / 860, 0, 1));
        if (appear <= 0) continue;
        const vectorX = particle.originX - centerX;
        const vectorY = particle.originY - centerY;
        const movement = reducedMotion ? 0 : Math.sin(time * 0.0016 + particle.phase) * particle.drift;
        const escape = reducedMotion ? 0 : Math.sin(time * 0.0009 + particle.phase) * particle.escape;
        const desiredX = particle.text
          ? particle.originX + movement
          : centerX + vectorX * pulse + Math.cos(particle.phase + time * 0.0012) * escape;
        const desiredY = particle.text
          ? particle.originY + Math.sin(time * 0.0015 + particle.phase) * particle.drift
          : centerY + vectorY * pulse + movement + Math.sin(particle.phase + time * 0.0012) * escape;
        particle.x += (desiredX - particle.x) * (0.035 + appear * 0.04);
        particle.y += (desiredY - particle.y) * (0.035 + appear * 0.04);

        ctx.globalAlpha = appear * (0.54 + Math.sin(time * 0.004 + particle.phase) * 0.28);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (0.83 + appear * 0.17), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reducedMotion) animationFrameId = requestAnimationFrame(render);
    };

    const changeMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      cancelAnimationFrame(animationFrameId);
      startedAt = performance.now();
      render(startedAt);
    };

    resize();
    render(performance.now());
    window.addEventListener("resize", resize, { passive: true });
    motionQuery.addEventListener?.("change", changeMotionPreference);

    return () => {
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener?.("change", changeMotionPreference);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return <canvas ref={canvasRef} className="heart-canvas" aria-hidden="true" />;
}
