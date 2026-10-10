import React, { useEffect, useRef } from "react";

const ParticleHeart = ({ text = "Te Amo" }) => {
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
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    let particles = [];
    let pulseAngle = 0;

    // Формула параметричного серця
    const getHeartPoint = (t) => {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );
      return { x, y };
    };

    class HeartParticle {
      constructor(targetX, targetY, color, size, isText = false) {
        // Зачатковий спаун по всьому екрану (ефект поступового збирання)
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseTargetX = targetX;
        this.baseTargetY = targetY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.size = size * dpr;
        this.isText = isText;

        // Фізика руху та коливань
        this.friction = 0.92;
        this.ease = Math.random() * 0.03 + 0.015;
        this.vx = 0;
        this.vy = 0;

        this.alpha = Math.random() * 0.7 + 0.3;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.wanderAngle = Math.random() * Math.PI * 2;
      }

      update(pulseScale) {
        // Перераховуємо ціль з урахуванням пульсації серця
        if (!this.isText) {
          const cx = width / 2;
          const cy = height / 2 - 40 * dpr;
          const dx = this.baseTargetX - cx;
          const dy = this.baseTargetY - cy;
          this.targetX = cx + dx * pulseScale;
          this.targetY = cy + dy * pulseScale;
        }

        // Плавне притягування до цільової позиції
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;

        this.vx = this.vx * this.friction + dx * this.ease;
        this.vy = this.vy * this.friction + dy * this.ease;

        // Легке броунівське коливання для відчуття "живих частинок"
        this.wanderAngle += 0.05;
        this.x += this.vx + Math.cos(this.wanderAngle) * 0.3 * dpr;
        this.y += this.vy + Math.sin(this.wanderAngle) * 0.3 * dpr;

        // Мерехтіння
        this.alpha = 0.5 + Math.sin(pulseAngle * 2 + this.pulseOffset) * 0.4;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
        ctx.fillStyle = this.color;

        // Сяйво для ключових частинок
        if (!this.isText && Math.random() < 0.3) {
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 8 * dpr;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];

      // 1. Створення контуру та внутрішнього об'єму серця
      const scale = Math.min(width, height) / 38;
      const cx = width / 2;
      const cy = height / 2 - 40 * dpr;

      // Контурні точки серця
      for (let t = 0; t < Math.PI * 2; t += 0.015) {
        const pt = getHeartPoint(t);
        const tx = cx + pt.x * scale;
        const ty = cy + pt.y * scale;

        const colors = ["#ff0066", "#ff3388", "#ff66aa", "#ff99cc", "#e60073"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 2 + 1.2;

        particles.push(new HeartParticle(tx, ty, color, size));
      }

      // Точки для заповнення внутрішньої частини
      for (let i = 0; i < 450; i++) {
        const t = Math.random() * Math.PI * 2;
        const shrink = Math.sqrt(Math.random()) * 0.88;
        const pt = getHeartPoint(t);
        const tx = cx + pt.x * scale * shrink;
        const ty = cy + pt.y * scale * shrink;

        const color = Math.random() < 0.6 ? "#ff1a75" : "#ff80bf";
        const size = Math.random() * 1.5 + 0.8;

        particles.push(new HeartParticle(tx, ty, color, size));
      }

      // 2. Створення частинок Тексту під серцем
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = width;
      tempCanvas.height = height;

      const fontSize = Math.min(width / 14, 46 * dpr);
      tempCtx.font = `700 ${fontSize}px 'Cinzel', serif`;
      tempCtx.fillStyle = "#ffffff";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";

      const textY = cy + scale * 18 + 20 * dpr;
      tempCtx.fillText(text, cx, textY);

      const imgData = tempCtx.getImageData(0, 0, width, height).data;
      const step = Math.floor(4 * dpr);

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (imgData[idx + 3] > 150) {
            const colors = ["#ffffff", "#ffccd5", "#ff4d88"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 1.6 + 0.9;

            particles.push(new HeartParticle(x, y, color, size, true));
          }
        }
      }
    };

    initParticles();

    const render = () => {
      // Плавний шлейф розмиття
      ctx.fillStyle = "rgba(8, 1, 10, 0.25)";
      ctx.fillRect(0, 0, width, height);

      pulseAngle += 0.035;
      const pulseScale = 1 + Math.sin(pulseAngle) * 0.045; // Біття серця

      particles.forEach((p) => {
        p.update(pulseScale);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return <canvas ref={canvasRef} className="heart-canvas" />;
};

export default ParticleHeart;
