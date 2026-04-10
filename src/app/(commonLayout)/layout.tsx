import Footer from "@/components/modules/HomePage/Footer";
import Navbar from "@/components/modules/HomePage/Navbar";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-50 via-background to-violet-50/40">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 lg:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}