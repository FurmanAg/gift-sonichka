import React from "react";
import AnimatedBackground from "./components/AnimatedBackground";
import RomanticHeart from "./components/RomanticHeart";
import SparkleTrail from "./components/SparkleTrail";

function App() {
  return (
    <div className="app-container">
      {/* Неонове фонове сяйво */}
      <div className="glow-orb glow-1"></div>
      <div className="glow-orb glow-2"></div>

      {/* Шар 1: Динамічний багатошаровий фон */}
      <AnimatedBackground />

      {/* Шар 2: Головна анімація серця */}
      <RomanticHeart text="Сяб) за МиНоНа!! 🩷" />

      {/* Шар 3: Блискітки та сердечка за курсором */}
      <SparkleTrail />
    </div>
  );
}

export default App;
