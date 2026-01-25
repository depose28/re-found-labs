import { useEffect, useState } from "react";

const PulseRadar = () => {
  const [activePoints, setActivePoints] = useState<number[]>([]);

  // Generate grid points
  const gridPoints = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const x = (i - 3.5) * 50;
      const y = (j - 3.5) * 50;
      const distance = Math.sqrt(x * x + y * y);
      if (distance > 30 && distance < 180) {
        gridPoints.push({ x: x + 200, y: y + 200, distance, id: `${i}-${j}` });
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      // Cycle through distance-based activation
      const time = Date.now() % 4000;
      const pulseRadius = (time / 4000) * 200;
      
      const active = gridPoints
        .filter(p => Math.abs(p.distance - pulseRadius) < 40)
        .map((_, idx) => idx);
      
      setActivePoints(active);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[500px] max-h-[500px]"
        style={{ filter: "blur(0.5px)" }}
      >
        {/* Concentric pulse rings */}
        {[1, 2, 3, 4].map((ring) => (
          <circle
            key={ring}
            cx="200"
            cy="200"
            r="40"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="1"
            opacity="0"
            className="animate-pulse-ring"
            style={{
              animationDelay: `${ring * 1}s`,
              animationDuration: "4s",
            }}
          />
        ))}

        {/* Grid points that light up */}
        {gridPoints.map((point, idx) => (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={activePoints.includes(idx) ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
            opacity={activePoints.includes(idx) ? 0.9 : 0.15}
            className="transition-all duration-300"
          />
        ))}

        {/* Center dot */}
        <circle
          cx="200"
          cy="200"
          r="8"
          fill="hsl(var(--accent))"
          className="animate-pulse"
          style={{ animationDuration: "2s" }}
        />
        
        {/* Center glow */}
        <circle
          cx="200"
          cy="200"
          r="16"
          fill="hsl(var(--accent))"
          opacity="0.3"
          className="animate-pulse"
          style={{ animationDuration: "2s" }}
        />
      </svg>
    </div>
  );
};

export default PulseRadar;
