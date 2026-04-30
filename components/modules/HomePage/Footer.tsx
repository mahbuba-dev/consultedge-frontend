"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  CalendarRange,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Experts", href: "/experts" },
  { label: "How it works", href: "/industries" },
  { label: "Contact", href: "/contact" },
];

const platformLinks = [
  { label: "Apply as expert", href: "/apply-expert" },
  { label: "Register", href: "/register" },
  { label: "Login", href: "/login" },
  { label: "Dashboard", href: "/dashboard" },
];

const socialLinks = [
  { label: "in", name: "LinkedIn", href: "https://www.linkedin.com/company/consultedge-global-/" },
  { label: "fb", name: "Facebook", href: "https://www.facebook.com/ConsultEdgeGlb/" },
  { label: "ig", name: "Instagram", href: "https://www.instagram.com/cegglobal/" },
  { label: "yt", name: "YouTube", href: "https://www.youtube.com/@ConsultEdge.Global" },
];

const trustSignals = [
  { label: "Verified experts", icon: ShieldCheck },
  { label: "Secure booking", icon: CalendarRange },
  { label: "Client-first experience", icon: Users },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    el.classList.add("opacity-0", "translate-y-8");

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        el.classList.add("footer-fade-up");
        el.classList.remove("opacity-0", "translate-y-8");
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className=" border-t border-slate-800 bg-slate-950 text-slate-200">
      <style>{`
        .footer-fade-up {
          transition: opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1);
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .footer-social-anim {
          transition: transform 0.2s ease-out, box-shadow 0.2s, border-color 0.2s;
        }
        .footer-social-anim:hover {
          transform: rotate(5deg) scale(1.05);
          box-shadow: 0 0 0 4px rgba(34,211,238,0.25);
          border-color: #06b6d4;
        }
        .footer-ink-link {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }
        .footer-ink-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0.5px;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);
          opacity: 0.8;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease-out;
        }
        .footer-ink-link:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      <div ref={footerRef} className="mx-auto w-full max-w-360 px-4 pt-4 md:px-6">
        {/* CTA SECTION */}
        <div className="relative overflow-hidden rounded-[2.1rem] border border-cyan-400/20 bg-linear-to-r from-blue-950 via-slate-900 to-cyan-950 p-6 shadow-[0_24px_70px_-30px_rgba(34,211,238,0.3)] md:p-8 lg:p-10">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Badge className="border-white/15 bg-white/10 text-white">
                <Sparkles className="mr-1 size-3.5" />
                Need help getting started?
              </Badge>

              <div>
                <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                  Talk with the right expert, faster.
                </h2>
                <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                  Browse trusted specialists, book with confidence, and let ConsultEdge support your next smart move.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {trustSignals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-slate-100"
                    >
                      <Icon className="size-3.5 text-cyan-200" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full bg-white px-5 text-slate-900 hover:bg-white/90">
                <Link href="/experts">
                  Browse experts <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button asChild className="h-11 rounded-full bg-linear-to-r from-blue-600 via-cyan-500 to-teal-400 px-10 text-white shadow-lg shadow-cyan-500/30 transition-all hover:from-blue-700 hover:via-cyan-600 hover:to-teal-500 hover:shadow-xl hover:shadow-cyan-500/40">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="mx-auto grid w-full max-w-360 gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.95fr] md:px-6">

        {/* BRAND */}
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-sky-500 text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-white">ConsultEdge</p>
              <p className="text-xs text-slate-400">Premium expert consultation network</p>
            </div>
          </Link>

          <p className="text-sm text-slate-300">
            A modern platform connecting clients with verified experts for smarter decisions.
          </p>

          <div className="flex gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                className="footer-social-anim flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* QUICK LINKS (FIXED ALIGNMENT) */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Quick links
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-ink-link text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* PLATFORM (FIXED ALIGNMENT) */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Platform
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            {platformLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="footer-ink-link text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <Mail className="size-4" />
            sales@consultedge.global
          </div>
          <div className="flex items-start gap-2">
            <Phone className="size-4" />
            +91 84482 96800
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-4" />
            Expert consultation support worldwide
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-360 flex-col justify-between gap-2 px-4 py-4 text-sm text-slate-400 md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} ConsultEdge</p>
          <div className="flex gap-4">
            <Link href="/experts" className="hover:text-white">Browse experts</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}