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
    <div className="max-w-md mx-auto py-10 space-y-4">
      {otpSent && (
        <p className="text-sm text-gray-600 text-center">
          OTP has been sent to <span className="font-semibold">{email}</span>
        </p>
      )}

      <ResetPasswordForm email={email} />
    </div>
  );
}