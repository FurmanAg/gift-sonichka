import React, { useEffect, useRef } from "react";

const CursorSparkles = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const handleResize = () => {
      dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener("resize", handleResize);

    const sparkles = [];

    class Sparkle {
      constructor(x, y) {
        this.x = x * dpr;
        this.y = y * dpr;
        this.size = (Math.random() * 3 + 1.5) * dpr;
        this.color = ["#ff0077", "#ff66bb", "#ffffff", "#e066ff", "#ffb3d9"][
          Math.floor(Math.random() * 5)
        ];
        this.vx = (Math.random() - 0.5) * 2.5 * dpr;
        this.vy = (Math.random() - 0.5) * 2.5 * dpr - 0.5 * dpr;
        this.alpha = 1;
        this.decay = Math.random() * 0.025 + 0.015;
        this.isHeart = Math.random() < 0.2; // 20% шанс випадіння маленького сердечка
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6 * dpr;

        if (this.isHeart) {
          const size = this.size * 2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.bezierCurveTo(
            this.x - size / 2,
            this.y - size / 2,
            this.x - size,
            this.y + size / 3,
            this.x,
            this.y + size,
          );
          ctx.bezierCurveTo(
            this.x + size,
            this.y + size / 3,
            this.x + size / 2,
            this.y - size / 2,
            this.x,
            this.y,
          );
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    const addSparkles = (x, y, count = 3) => {
      for (let i = 0; i < count; i++) {
        sparkles.push(new Sparkle(x, y));
      }
    };

    const handleMouseMove = (e) => {
      addSparkles(e.clientX, e.clientY, 3);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        addSparkles(e.touches[0].clientX, e.touches[0].clientY, 4);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.update();
        s.draw();
        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="sparkles-canvas" />;
};

export default CursorSparkles;
