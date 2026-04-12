import ForgetPasswordForm from "@/components/modules/auth/ForgetPasswordForm";
import { getUserInfo } from "@/src/services/auth.services";

type ChangePasswordParams = {
  email?: string;
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<ChangePasswordParams>;
}) {
  const params = await searchParams;
  const user = await getUserInfo();
  const email = params.email || user?.email;

  return (
    <div className="max-w-md mx-auto py-10 space-y-4">
      <ForgetPasswordForm
        initialEmail={email ?? ""}
        lockEmail={Boolean(email)}
        title="Change Password"
        description="We will send a reset OTP to your email so you can set a new password securely."
        submitLabel="Send OTP"
        pendingLabel="Sending OTP..."
        showLoginLink={false}
      />
    </div>
  );
}