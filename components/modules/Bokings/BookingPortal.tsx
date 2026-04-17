"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
   <div className="fixed inset-0 z-999999 pointer-events-auto overflow-y-auto">
  <div className="min-h-screen flex items-start justify-center py-10">
    {children}
  </div>
</div>,
    document.body
  );
}
