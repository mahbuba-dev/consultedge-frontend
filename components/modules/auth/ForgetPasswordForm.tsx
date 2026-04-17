"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import AppSubmitButton from "@/components/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forgotPasswordService } from "@/src/services/auth.services";
import { forgotPasswordZodSchema } from "@/src/zod/auth.validation";

type ForgetPasswordFormProps = {
  initialEmail?: string;
  lockEmail?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  pendingLabel?: string;
  showLoginLink?: boolean;
};

export default function ForgetPasswordForm({
  initialEmail = "",
  lockEmail = false,
  title = "Forgot Password",
  description = "Enter your email and we will send you an OTP to reset your password.",
  submitLabel = "Send Reset OTP",
  pendingLabel = "Sending OTP...",
  showLoginLink = true,
}: ForgetPasswordFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: initialEmail,
    },
    onSubmit: async ({ value }) => {
      const validation = forgotPasswordZodSchema.safeParse(value);

      if (!validation.success) {
        const message = validation.error.flatten().fieldErrors.email?.[0] || "Enter a valid email";
        toast.error(message);
        return;
      }

      try {
        const response = await forgotPasswordService({ email: value.email.trim() });

        if (!response?.success) {
          const message = response?.message || "Failed to send reset OTP";
          toast.error(message);
          return;
        }

        toast.success(response.message || "Reset OTP sent to your email");
        router.push(`/reset-password?email=${encodeURIComponent(value.email.trim())}&otpSent=true`);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || "Failed to send reset OTP";
        toast.error(message);
      }
    },
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-4 py-10">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="email">
          {(field) => (
            <div className="space-y-1.5">
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                readOnly={lockEmail}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring read-only:bg-muted/50 read-only:text-muted-foreground"
              />
              {field.state.meta.errors?.[0] ? (
                <Alert variant="destructive">
                  <AlertDescription>{String(field.state.meta.errors[0])}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.isSubmitting] as const}>
          {([isSubmitting]) => (
            <AppSubmitButton isPending={isSubmitting} pendingLabel={pendingLabel}>
              {submitLabel}
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </form>

      {showLoginLink ? (
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      ) : null}
    </div>
  );
}


// "use client";
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { useForm } from "@tanstack/react-form";


// import AppField from "@/src/components/form/AppField";
// import AppSubmitButton from "@/src/components/form/AppSubmitButton";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// import { IForgotPasswordPayload, forgotPasswordZodSchema } from "@/src/zod/auth.validation";
// import Link from "next/link";

// const ForgotPasswordForm = () => {
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [successMessage, setsuccessMessage] = useState<string | null>(null);

//   const { mutateAsync, isPending } = useMutation({
//     mutationFn: (payload: IForgotPasswordPayload) => forgotPasswordAction(payload),
//   });

//   const form = useForm({
//     defaultValues: {
//       email: "",
//     },

//     onSubmit: async ({ value }) => {
//       setServerError(null);
//       setsuccessMessage(null);

//       try {
//         const result = (await mutateAsync(value)) as any;

//         if (!result.success) {
//           setServerError(result.message);
//           return;
//         }

//         setsuccessMessage(result.message);
//       } catch (error: any) {
//         setServerError(error.message);
//       }
//     },
//   });

//   return (
//     <Card className="w-full max-w-md mx-auto shadow-md">
//       <CardHeader className="text-center">
//         <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
//         <CardDescription>Enter your email to receive a reset link</CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form
//           noValidate
//           onSubmit={(e) => {
//             e.preventDefault();
//             form.handleSubmit();
//           }}
//           className="space-y-4"
//         >
//           <form.Field
//             name="email"
//             validators={{ onChange: forgotPasswordZodSchema.shape.email }}
//           >
//             {(field) => (
//               <AppField
//                 field={field}
//                 label="Email"
//                 type="email"
//                 placeholder="Enter your email"
//               />
//             )}
//           </form.Field>

//           {serverError && (
//             <Alert variant="destructive">
//               <AlertDescription>{serverError}</AlertDescription>
//             </Alert>
//           )}

//           {successMessage && (
//             <Alert>
//               <AlertDescription>{successMessage}</AlertDescription>
//             </Alert>
//           )}

//           <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
//             {([canSubmit, isSubmitting]) => (
//               <AppSubmitButton
//                 isPending={isSubmitting || isPending}
//                 pendingLabel="Sending..."
//                 disabled={!canSubmit}
//               >
//                 Send Reset Link
//               </AppSubmitButton>
//             )}
//           </form.Subscribe>
//         </form>
//       </CardContent>

//       <CardFooter className="justify-center border-t pt-4">
//         <p className="text-sm text-muted-foreground">
//           Remember your password?{" "}
//           <Link href="/login" className="text-primary font-medium hover:underline">
//             Log In
//           </Link>
//         </p>
//       </CardFooter>
//     </Card>
//   );
// };

// export default ForgotPasswordForm;