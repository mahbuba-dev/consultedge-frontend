import AuthShell from "@/components/modules/auth/AuthShell";
import LoginForm from "@/components/modules/auth/loginForm";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";

interface LoginParams {
  searchParams: Promise<{ redirect?: string; passwordReset?: string }>;
}

const highlights = [
  { icon: ShieldCheck, title: "Verified experts", desc: "Every profile is reviewed and credentialed." },
  { icon: Sparkles, title: "Smart consultations", desc: "Find the right specialist in minutes." },
  { icon: Zap, title: "Fast booking", desc: "Secure payment and instant confirmations." },
];

const LoginPage = async ({ searchParams }: LoginParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;
  const passwordReset = params.passwordReset === "true";

  return (
    <AuthShell
      eyebrow="Welcome back to ConsultEdge"
      titleLead="Sign in to keep moving"
      titleAccent="with the right expert."
      description="Pick up where you left off — manage bookings, message experts, and track every consultation from one premium dashboard."
      highlights={highlights}
    >
      <LoginForm redirectPath={redirectPath} passwordReset={passwordReset} />
    </AuthShell>
  );
};

export default LoginPage;
