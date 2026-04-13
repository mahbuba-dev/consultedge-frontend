import React, { useEffect, useState } from "react";

// Gradient pulse animation (CSS)
// Add this to your global CSS if not already present:
// @keyframes cta-gradient-pulse {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }

export default function CTABanner() {
  const [showHeadline, setShowHeadline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowHeadline(true), 200);
    const t2 = setTimeout(() => setShowButton(true), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section
      className="relative mx-auto my-12 flex max-w-3xl flex-col items-center justify-center overflow-hidden rounded-3xl px-8 py-12 text-center shadow-xl"
      style={{
        background:
          "linear-gradient(120deg, #2563eb 0%, #06b6d4 50%, #3b82f6 100%)",
        backgroundSize: "200% 200%",
        animation: "cta-gradient-pulse 18s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes cta-gradient-pulse {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <h2
        className={`mb-4 text-3xl font-bold tracking-tight text-white drop-shadow-lg transition-transform duration-700 ease-out ${
          showHeadline ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
        }`}
      >
        Ready to unlock expert guidance?
      </h2>
      <p className="mb-8 text-lg text-blue-100/90">
        Book a session with a top specialist and accelerate your next big move.
      </p>
      <button
        className={`rounded-full bg-white px-8 py-3 text-lg font-semibold text-blue-700 shadow-lg transition-opacity duration-700 ease-out ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
      >
        Book a Consultation
      </button>
    </section>
  );
}
