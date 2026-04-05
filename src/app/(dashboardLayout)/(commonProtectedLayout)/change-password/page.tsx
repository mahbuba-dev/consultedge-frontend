import ChangePasswordForm from "@/components/form/ChangePasswordForm";

type ChangePasswordParams = {
  email?: string;
};

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<ChangePasswordParams>;
}) {
  const params = await searchParams;
  const email = params.email;

  return (
    <div className="max-w-md mx-auto py-10 space-y-4">
      <p className="text-center text-gray-600">
        Please change your password to continue
      </p>

      {email && (
        <p className="text-center text-sm text-gray-500">
          Logged in as <span className="font-semibold">{email}</span>
        </p>
      )}

      <ChangePasswordForm />
    </div>
  );
}