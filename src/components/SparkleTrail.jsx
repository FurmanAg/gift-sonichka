import { useEffect, useRef } from "react";

const COLORS = ["#ff247f", "#ff72b5", "#ffd0e6", "#ca6cff"];

function drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.28);
  ctx.bezierCurveTo(x - size * 0.72, y - size * 0.38, x - size, y + size * 0.5, x, y + size);
  ctx.bezierCurveTo(x + size, y + size * 0.5, x + size * 0.72, y - size * 0.38, x, y + size * 0.28);
  ctx.fill();
}

function drawStar(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius * 0.26, y - radius * 0.26);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x + radius * 0.26, y + radius * 0.26);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius * 0.26, y + radius * 0.26);
  ctx.lineTo(x - radius, y);
  ctx.lineTo(x - radius * 0.26, y - radius * 0.26);
  ctx.closePath();
  ctx.fill();
}

export default function SparkleTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastPoint = null;
    const sparkles = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const emit = (x, y, count) => {
      const maximum = reducedMotion ? 32 : 130;
      for (let index = 0; index < count; index += 1) {
        if (sparkles.length >= maximum) sparkles.shift();
        sparkles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2.25,
          vy: (Math.random() - 0.5) * 2.25 - 0.35,
          radius: Math.random() * 2 + 0.75,
          alpha: 1,
          decay: Math.random() * 0.028 + 0.018,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          shape: Math.random() < 0.1 ? "heart" : Math.random() < 0.18 ? "star" : "dot",
        });
      }
    };

    const handlePointerMove = (event) => {
      if (reducedMotion) return;
      const point = { x: event.clientX, y: event.clientY, time: performance.now() };
      const distance = lastPoint ? Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) : 0;
      const elapsed = lastPoint ? Math.max(point.time - lastPoint.time, 1) : 16;
      const speed = distance / elapsed;
      if (!lastPoint || distance > 5) emit(point.x, point.y, Math.min(5, 1 + Math.round(speed * 1.8)));
      lastPoint = point;
    };

    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) emit(touch.clientX, touch.clientY, 1);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let index = sparkles.length - 1; index >= 0; index -= 1) {
        const sparkle = sparkles[index];
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.vx *= 0.975;
        sparkle.vy = sparkle.vy * 0.975 + 0.006;
        sparkle.alpha -= sparkle.decay;
        if (sparkle.alpha <= 0) {
          sparkles.splice(index, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = sparkle.alpha;
        ctx.fillStyle = sparkle.color;
        ctx.shadowColor = sparkle.color;
        ctx.shadowBlur = 8;
        if (sparkle.shape === "heart") drawHeart(ctx, sparkle.x, sparkle.y, sparkle.radius * 1.7);
        else if (sparkle.shape === "star") drawStar(ctx, sparkle.x, sparkle.y, sparkle.radius * 1.7);
        else {
          ctx.beginPath();
          ctx.arc(sparkle.x, sparkle.y, sparkle.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      frameId = requestAnimationFrame(render);
    };

    const changeMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      sparkles.length = 0;
    };

    resize();
    render();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    motionQuery.addEventListener?.("change", changeMotionPreference);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      motionQuery.removeEventListener?.("change", changeMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} className="sparkles-canvas" aria-hidden="true" />;
}
