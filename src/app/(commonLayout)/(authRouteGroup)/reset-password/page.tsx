import ResetPasswordForm from "@/components/form/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; otpSent?: string }>;
})  {
  const params = await searchParams;
  const email = params.email;
  const otpSent = params.otpSent === "true";

  if (!email) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Invalid or expired reset link</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <ResetPasswordForm email={email} otpSent={otpSent} />
    </div>
  );
}