import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Experts", href: "/experts" },
  { label: "Industries", href: "/industries" },
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

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 md:px-6">
        <div className="rounded-[1.75rem] border border-cyan-400/20 bg-linear-to-r from-violet-950 via-slate-900 to-cyan-950 p-5 shadow-lg shadow-cyan-500/10 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Let’s build what matters
              </p>
              <h2 className="text-2xl font-bold text-white">Need help choosing the right expert?</h2>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                Talk to the ConsultEdge team and get matched with the right specialist for your next move.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/experts">
                <Button className="bg-white text-slate-900 hover:bg-white/90">
                  Browse experts
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr] md:px-6">
        <div className="space-y-4">
          <div>
            <p className="text-xl font-semibold text-white">ConsultEdge</p>
            <p className="mt-2 max-w-sm text-sm text-slate-300">
              Premium expert consultation for modern teams — designed to help clients discover,
              book, and manage high-value sessions with clarity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {socialLinks.map(({ label, name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase transition hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-200"
                aria-label={name}
                title={name}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Quick links
          </h3>
          <div className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Platform
          </h3>
          <div className="space-y-3 text-sm">
            {platformLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Contact
          </h3>
          <div className="space-y-3 text-sm text-slate-300">
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
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} ConsultEdge. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="transition hover:text-white">
              Contact us
            </Link>
            <Link href="/experts" className="transition hover:text-white">
              Browse experts
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
