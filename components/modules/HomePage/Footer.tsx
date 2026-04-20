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
  // Fade-up on scroll
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
    <footer className="mt-20 border-t border-slate-800 bg-slate-950 pb-24 text-slate-200 sm:pb-0">
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
        .footer-ink-link span {
          position: relative;
          z-index: 1;
        }
        .footer-ink-link::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0.5px;
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);
          opacity: 0.8;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease-out;
        }
        .footer-ink-link:hover::after, .footer-ink-link:focus-visible::after {
          transform: scaleX(1);
        }
      `}</style>
      <div ref={footerRef} className="mx-auto w-full max-w-7xl px-4 pt-8 md:px-6 md:pt-10">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-cyan-400/20 bg-linear-to-r from-blue-950 via-slate-900 to-cyan-950 p-5 shadow-[0_24px_70px_-30px_rgba(34,211,238,0.3)] md:rounded-[2.1rem] md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Badge className="w-fit border-white/15 bg-white/10 text-white hover:bg-white/10">
                <Sparkles className="mr-1 size-3.5" />
                Need help getting started?
              </Badge>

              <div className="space-y-2">
                <h2 className="max-w-xl text-[1.85rem] leading-tight font-bold text-white sm:text-3xl lg:text-4xl">
                  Talk with the right expert, faster.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Browse trusted specialists, book with confidence, and let ConsultEdge support your next smart move.
                </p>
              </div>

              <div className="grid gap-2 sm:flex sm:flex-wrap">
                {trustSignals.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-slate-100"
                    >
                      <Icon className="size-3.5 text-cyan-200" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
   
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button asChild className="h-11 w-full rounded-full bg-white px-5 text-sm text-slate-900 hover:bg-white/90 sm:w-auto">
                <Link href="/experts">
                  Browse experts
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-11 w-full rounded-full border-white/20 bg-transparent px-5 text-sm text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.95fr] md:px-6 lg:gap-14 lg:py-14">
        <div className="space-y-5 rounded-[1.75rem] border border-white/8 bg-white/3 p-5 sm:p-6 md:border-0 md:bg-transparent md:p-0">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 via-cyan-600 to-sky-500 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-white">ConsultEdge</p>
              <p className="text-xs text-slate-400">Premium expert consultation network</p>
            </div>
          </Link>

          <p className="max-w-sm text-sm text-slate-300">
            A modern platform that helps clients discover, book, and manage valuable expert sessions with more clarity and confidence.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">Trusted</p>
              <p className="mt-1 text-xs text-slate-400">Verified professionals</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">Secure</p>
              <p className="mt-1 text-xs text-slate-400">Smooth payment flow</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">Simple</p>
              <p className="mt-1 text-xs text-slate-400">Smart dashboards</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {socialLinks.map(({ label, name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="footer-social-anim flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase"
                aria-label={name}
                title={name}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5 md:border-0 md:bg-transparent md:p-0">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Quick links
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-ink-link block transition hover:text-white">
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5 md:border-0 md:bg-transparent md:p-0">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Platform
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
            {platformLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-ink-link block transition hover:text-white">
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-5 md:border-0 md:bg-transparent md:p-0">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Contact
          </h3>
          <div className="space-y-4 text-sm text-slate-300">
            <a href="mailto:sales@consultedge.global" className="flex items-start gap-2 transition hover:text-white">
              <Mail className="mt-0.5 size-4" />
              <span>sales@consultedge.global</span>
            </a>
            <a href="tel:+918448296800" className="flex items-start gap-2 transition hover:text-white">
              <Phone className="mt-0.5 size-4" />
              <span>+91 84482 96800</span>
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4" />
              <span>Connect with our team for expert consultation and tailored guidance.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="text-center md:text-left">© {new Date().getFullYear()} ConsultEdge. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-end">
            <Link href="/contact" className="footer-ink-link transition hover:text-white">
              <span>Contact us</span>
            </Link>
            <Link href="/experts" className="footer-ink-link transition hover:text-white">
              <span>Browse experts</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
