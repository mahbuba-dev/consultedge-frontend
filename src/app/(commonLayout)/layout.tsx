import SupportChatWidget from "@/components/AI/SupportChatWidget";
import Footer from "@/components/modules/HomePage/Footer";
import Navbar from "@/components/modules/HomePage/Navbar";
import RouteTransition from "@/components/modules/HomePage/RouteTransition";

// Pages may read cookies / call the live API — opt out of static prerender.
export const dynamic = "force-dynamic";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 via-background to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Navbar />
      <main className="mx-auto flex-1 w-full max-w-360 px-4 py-6 md:px-6 lg:py-8">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <Footer />
      <SupportChatWidget />
    </div>
  );
}