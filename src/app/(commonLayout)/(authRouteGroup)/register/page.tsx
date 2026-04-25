import AuthShell from "@/components/modules/auth/AuthShell";
import RegisterForm from "@/components/modules/auth/RegisterForm";
import { Rocket, ShieldCheck, Users } from "lucide-react";

interface RegisterParams {
  searchParams: Promise<{ redirect?: string }>;
}

const highlights = [
  { icon: Rocket, title: "Get started in minutes", desc: "Create your account and unlock the full expert network." },
  { icon: Users, title: "Curated specialists", desc: "Hand-picked professionals across every major industry." },
  { icon: ShieldCheck, title: "Trusted & secure", desc: "Encrypted sessions, verified profiles, safe payments." },
];

const RegisterPage = async ({ searchParams }: RegisterParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;

  return (
    <AuthShell
      eyebrow="Join the ConsultEdge network"
      titleLead="Create your account"
      titleAccent="and meet the right experts."
      description="One account unlocks discovery, bookings, secure messaging, and a personalized dashboard built for fast decisions."
      highlights={highlights}
    >
      <RegisterForm redirectPath={redirectPath} />
    </AuthShell>
  );
};

export default RegisterPage;

