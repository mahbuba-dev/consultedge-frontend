import React from "react";
import { useSpring, animated } from "@react-spring/web";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ value, duration = 1200, prefix = "", suffix = "", className }: AnimatedCounterProps) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { duration },
  });

  return (
    <animated.span className={className}>
      {number.to((n: number) => `${prefix}${Math.floor(n).toLocaleString()}${suffix}`)}
    </animated.span>
  );
}
