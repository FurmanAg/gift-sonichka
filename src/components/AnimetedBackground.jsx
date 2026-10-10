import React, { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let height = (canvas.height = window.innerHeight * window.devicePixelRatio);

    const handleResize = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
    };
    window.addEventListener("resize", handleResize);

    // Фонові літаючі частинки та прозорі серця
    const bgParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: (Math.random() * 3 + 1) * window.devicePixelRatio,
      speedY: -(Math.random() * 0.4 + 0.1) * window.devicePixelRatio,
      speedX: (Math.random() - 0.5) * 0.2 * window.devicePixelRatio,
      opacity: Math.random() * 0.5 + 0.1,
      color: ["#ff2a75", "#ff75b5", "#b336ff", "#e078ff"][
        Math.floor(Math.random() * 4)
      ],
      isHeart: Math.random() < 0.25,
    }));

    const drawHeart = (cx, cy, size, color, opacity) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(
        -size / 2,
        (size + topCurveHeight) / 2,
        0,
        size,
        0,
        size,
      );
      ctx.bezierCurveTo(
        0,
        size,
        size / 2,
        (size + topCurveHeight) / 2,
        size / 2,
        topCurveHeight,
      );
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      bgParticles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.isHeart) {
          drawHeart(p.x, p.y, p.size * 3, p.color, p.opacity);
        } else {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
};

export default AnimatedBackground;
