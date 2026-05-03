"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlastVariant = "button" | "search" | "sidebar" | "success" | "card";

interface Particle {
  id: number;
  /** Final X translation from burst center (px) */
  tx: number;
  /** Final Y translation from burst center (px) */
  ty: number;
  size: number;
  dur: number;
  delay: number;
}

interface BurstState {
  id: number;
  /** Viewport X of burst origin */
  cx: number;
  /** Viewport Y of burst origin */
  cy: number;
  particles: Particle[];
  ripple: boolean;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  BlastVariant,
  {
    count: number;
    dist: [number, number];
    size: [number, number];
    dur: [number, number];
    ripple: boolean;
  }
> = {
  button:  { count: 8,  dist: [18, 28], size: [2,   3.5], dur: [220, 280], ripple: true  },
  search:  { count: 6,  dist: [16, 26], size: [2,   3  ], dur: [240, 300], ripple: true  },
  sidebar: { count: 6,  dist: [14, 22], size: [1.5, 3  ], dur: [200, 260], ripple: false },
  success: { count: 10, dist: [20, 34], size: [2,   4  ], dur: [260, 320], ripple: true  },
  card:    { count: 4,  dist: [12, 20], size: [2,   3  ], dur: [200, 250], ripple: true  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

let uid = 0;
const rng = (min: number, max: number) => min + Math.random() * (max - min);

function makeBurst(cx: number, cy: number, variant: BlastVariant): BurstState {
  const cfg = VARIANT_CONFIG[variant];
  const particles: Particle[] = Array.from({ length: cfg.count }, (_, i) => {
    // Evenly distribute base angles, then add ±15° jitter for organic feel
    const angleDeg = (360 / cfg.count) * i + rng(-15, 15);
    const rad = (angleDeg * Math.PI) / 180;
    const dist = rng(cfg.dist[0], cfg.dist[1]);
    return {
      id: ++uid,
      tx: Math.cos(rad) * dist,
      ty: Math.sin(rad) * dist,
      size: rng(cfg.size[0], cfg.size[1]),
      dur: rng(cfg.dur[0], cfg.dur[1]),
      delay: rng(0, 25),
    };
  });
  return { id: ++uid, cx, cy, particles, ripple: cfg.ripple };
}

// ─── Single burst renderer (portal → body) ───────────────────────────────────

function BurstRenderer({
  burst,
  onDone,
}: {
  burst: BurstState;
  onDone: () => void;
}) {
  useEffect(() => {
    const max =
      Math.max(...burst.particles.map((p) => p.dur + p.delay)) + 50;
    const t = setTimeout(onDone, max);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed z-[9999]"
      style={{ left: burst.cx, top: burst.cy }}
    >
      {/* Soft ripple ring */}
      {burst.ripple && <span className="ce-ripple" />}

      {/* Micro particles */}
      {burst.particles.map((p) => (
        <span
          key={p.id}
          className="ce-particle"
          style={
            {
              width: p.size,
              height: p.size,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animationDuration: `${p.dur}ms`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
}

// ─── BlastEffect wrapper component ───────────────────────────────────────────

interface BlastEffectProps {
  children: React.ReactNode;
  variant?: BlastVariant;
  className?: string;
  /** Disable the effect (e.g. during loading) */
  disabled?: boolean;
  /**
   * Override which interaction fires the burst.
   * Defaults: search → focus | card → hover | everything else → click
   */
  on?: "click" | "focus" | "hover";
}

/**
 * Wrap any interactive element with `<BlastEffect>` to add a premium
 * glassmorphic micro-particle burst on interaction.
 *
 * @example
 * // Button click
 * <BlastEffect variant="button">
 *   <Button>Book Now</Button>
 * </BlastEffect>
 *
 * // Search focus
 * <BlastEffect variant="search">
 *   <input ... />
 * </BlastEffect>
 */
export function BlastEffect({
  children,
  variant = "button",
  className,
  disabled = false,
  on,
}: BlastEffectProps) {
  const [bursts, setBursts] = useState<BurstState[]>([]);

  const fire = useCallback(
    (e: React.SyntheticEvent) => {
      if (disabled) return;
      const el = e.currentTarget as HTMLElement;
      const rect = el.getBoundingClientRect();
      setBursts((prev) => [
        ...prev,
        makeBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, variant),
      ]);
    },
    [disabled, variant],
  );

  const remove = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Default interaction type per variant
  const trigger =
    on ?? (variant === "search" ? "focus" : variant === "card" ? "hover" : "click");

  return (
    <>
      <div
        className={className}
        onClick={trigger === "click" ? fire : undefined}
        onFocus={trigger === "focus" ? fire : undefined}
        onMouseEnter={trigger === "hover" ? fire : undefined}
      >
        {children}
      </div>

      {bursts.map((burst) => (
        <BurstRenderer
          key={burst.id}
          burst={burst}
          onDone={() => remove(burst.id)}
        />
      ))}
    </>
  );
}

// ─── Programmatic hook ────────────────────────────────────────────────────────

/**
 * Use when you need imperative control over the blast effect,
 * e.g. firing from a server action callback or toast event.
 *
 * @example
 * const { fireFromEvent, BlastPortal } = useBlast('success');
 *
 * return (
 *   <>
 *     <Button onClick={(e) => { submitForm(); fireFromEvent(e); }}>Submit</Button>
 *     {BlastPortal}
 *   </>
 * );
 */
export function useBlast(variant: BlastVariant = "button") {
  const [bursts, setBursts] = useState<BurstState[]>([]);

  const fire = useCallback(
    (x: number, y: number) => {
      setBursts((prev) => [...prev, makeBurst(x, y, variant)]);
    },
    [variant],
  );

  const fireFromEvent = useCallback(
    (e: React.MouseEvent | React.FocusEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    [fire],
  );

  const remove = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const BlastPortal =
    bursts.length > 0
      ? bursts.map((burst) => (
          <BurstRenderer
            key={burst.id}
            burst={burst}
            onDone={() => remove(burst.id)}
          />
        ))
      : null;

  return { fire, fireFromEvent, BlastPortal };
}
