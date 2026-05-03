type PremiumGlassBackgroundProps = {
  intensity?: "calm" | "balanced" | "rich";
  className?: string;
};

export type PremiumGlassIntensity = NonNullable<PremiumGlassBackgroundProps["intensity"]>;

const INTENSITY = {
  calm: {
    orbCount: 3,
    particleCount: 10,
    durationScale: 1.2,
    opacityScale: 0.8,
    tintClass:
      "bg-[radial-gradient(circle_at_8%_6%,rgba(125,211,252,0.09),transparent_42%),radial-gradient(circle_at_84%_12%,rgba(96,165,250,0.08),transparent_44%),radial-gradient(circle_at_50%_72%,rgba(56,189,248,0.07),transparent_48%)]",
  },
  balanced: {
    orbCount: 4,
    particleCount: 15,
    durationScale: 1,
    opacityScale: 1,
    tintClass:
      "bg-[radial-gradient(circle_at_8%_6%,rgba(125,211,252,0.12),transparent_42%),radial-gradient(circle_at_84%_12%,rgba(96,165,250,0.11),transparent_44%),radial-gradient(circle_at_50%_72%,rgba(56,189,248,0.09),transparent_48%)]",
  },
  rich: {
    orbCount: 4,
    particleCount: 15,
    durationScale: 0.9,
    opacityScale: 1.18,
    tintClass:
      "bg-[radial-gradient(circle_at_8%_6%,rgba(125,211,252,0.15),transparent_40%),radial-gradient(circle_at_84%_12%,rgba(96,165,250,0.13),transparent_42%),radial-gradient(circle_at_50%_72%,rgba(56,189,248,0.12),transparent_46%)]",
  },
} as const;

const orbLayers = [
  { left: "6%", top: "8%", size: 240, blur: 34, x: 16, y: -22, duration: 62, delay: -9, opacity: 0.16 },
  { left: "68%", top: "12%", size: 220, blur: 32, x: -14, y: 18, duration: 74, delay: -24, opacity: 0.14 },
  { left: "24%", top: "56%", size: 260, blur: 38, x: 20, y: 14, duration: 78, delay: -15, opacity: 0.13 },
  { left: "78%", top: "64%", size: 210, blur: 30, x: -18, y: -16, duration: 70, delay: -32, opacity: 0.12 },
];

const particles = [
  { left: "8%", top: "18%", size: 2, x: 9, y: -14, duration: 34, delay: -5, opacity: 0.07 },
  { left: "13%", top: "62%", size: 2, x: -8, y: 12, duration: 40, delay: -11, opacity: 0.06 },
  { left: "18%", top: "32%", size: 3, x: 11, y: -10, duration: 38, delay: -16, opacity: 0.08 },
  { left: "24%", top: "74%", size: 2, x: -7, y: 10, duration: 44, delay: -19, opacity: 0.06 },
  { left: "31%", top: "20%", size: 2, x: 8, y: -13, duration: 36, delay: -8, opacity: 0.07 },
  { left: "38%", top: "48%", size: 3, x: -10, y: 14, duration: 46, delay: -22, opacity: 0.09 },
  { left: "45%", top: "80%", size: 2, x: 6, y: -9, duration: 42, delay: -27, opacity: 0.06 },
  { left: "52%", top: "28%", size: 3, x: -8, y: 11, duration: 39, delay: -13, opacity: 0.08 },
  { left: "58%", top: "66%", size: 2, x: 7, y: -12, duration: 35, delay: -18, opacity: 0.06 },
  { left: "64%", top: "40%", size: 2, x: -9, y: 13, duration: 43, delay: -23, opacity: 0.07 },
  { left: "70%", top: "22%", size: 3, x: 10, y: -11, duration: 37, delay: -12, opacity: 0.08 },
  { left: "76%", top: "72%", size: 2, x: -6, y: 10, duration: 45, delay: -29, opacity: 0.06 },
  { left: "82%", top: "34%", size: 2, x: 8, y: -10, duration: 41, delay: -17, opacity: 0.07 },
  { left: "88%", top: "58%", size: 3, x: -9, y: 12, duration: 47, delay: -26, opacity: 0.09 },
  { left: "92%", top: "16%", size: 2, x: 7, y: -9, duration: 33, delay: -7, opacity: 0.06 },
];

export default function PremiumGlassBackground({
  intensity = "balanced",
  className = "",
}: PremiumGlassBackgroundProps) {
  const config = INTENSITY[intensity];
  const activeOrbs = orbLayers.slice(0, config.orbCount);
  const activeParticles = particles.slice(0, config.particleCount);

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} aria-hidden>
      <div className={`absolute inset-0 ${config.tintClass}`} />

      <div className="absolute inset-0 z-0">
        {activeOrbs.map((orb, index) => (
          <span
            key={`${orb.left}-${orb.top}`}
            className="consultedge-bg-orb absolute rounded-full bg-linear-to-br from-sky-200/40 via-blue-200/24 to-cyan-200/16 dark:from-sky-300/24 dark:via-blue-300/16 dark:to-cyan-300/12"
            style={{
              left: orb.left,
              top: orb.top,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              animationDelay: `${orb.delay - index * 2}s`,
              ["--orb-x" as string]: `${orb.x}px`,
              ["--orb-y" as string]: `${orb.y}px`,
              ["--orb-duration" as string]: `${Math.round(orb.duration * config.durationScale)}s`,
              ["--orb-blur" as string]: `${orb.blur}px`,
              ["--orb-opacity" as string]: `${(orb.opacity * config.opacityScale).toFixed(3)}`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-1">
        {activeParticles.map((particle) => (
          <span
            key={`${particle.left}-${particle.top}`}
            className="consultedge-bg-particle absolute rounded-full bg-slate-100 dark:bg-slate-200"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              ["--particle-x" as string]: `${particle.x}px`,
              ["--particle-y" as string]: `${particle.y}px`,
              ["--particle-duration" as string]: `${Math.round(particle.duration * config.durationScale)}s`,
              ["--particle-opacity" as string]: `${(particle.opacity * config.opacityScale).toFixed(3)}`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-2 bg-[linear-gradient(180deg,rgba(255,255,255,0.64),rgba(248,250,252,0.38))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.34))]" />
    </div>
  );
}