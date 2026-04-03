"use client";

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Forgot Password form</h1>
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
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   const { mutateAsync, isPending } = useMutation({
//     mutationFn: (payload: IForgotPasswordPayload) => forgotPasswordAction(payload),
//   });

//   const form = useForm({
//     defaultValues: {
//       email: "",
//     },

//     onSubmit: async ({ value }) => {
//       setServerError(null);
//       setSuccessMessage(null);

//       try {
//         const result = (await mutateAsync(value)) as any;

//         if (!result.success) {
//           setServerError(result.message);
//           return;
//         }

//         setSuccessMessage(result.message);
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