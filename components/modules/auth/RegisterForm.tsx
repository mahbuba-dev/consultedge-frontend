// "use client";
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { useState, useEffect, useMemo } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { useForm } from "@tanstack/react-form";
// import { toast } from "sonner";

// import { registerAction } from "@/src/app/(commonLayout)/(authRouteGroup)/register/_action";
// // import { emailAvailabilityAction } from "@/src/app/(commonLayout)/(authRouteGroup)/register/_emailCheck";

// import AppField from "@/components/shared/form/AppField";
// import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";

// import { IRegisterPayload, registerZodSchema } from "@/src/zod/auth.validation";
// import Link from "next/link";
// import { emailAvailabilityAction } from "@/src/app/(commonLayout)/(authRouteGroup)/register/_emailCheack";

// interface RegisterFormProps {
//   redirectPath?: string;
// }

// const RegisterForm = ({ redirectPath }: RegisterFormProps) => {
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [emailStatus, setEmailStatus] = useState<"checking" | "exists" | "ok" | null>(null);
//   // const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");

//   const { mutateAsync, isPending } = useMutation({
//     mutationFn: (payload: IRegisterPayload) =>
//       registerAction(payload, redirectPath),
//   });

//   // Password Strength Logic
//   const checkStrength = (password: string) => {
//     if (password.length < 6) return "weak";
//     if (/[A-Z]/.test(password) && /\d/.test(password)) return "strong";
//     return "medium";
//   };

//   const form = useForm({
//     defaultValues: {
//       fullName: "",
//       email: "",
//       password: "",
//     },

//     onSubmit: async ({ value }) => {
//       setServerError(null);

//       try {
//         const result = (await mutateAsync(value)) as any;

//         if (!result.success) {
//           setServerError(result.message);
//           toast.error(result.message);
//           return;
//         }

//         toast.success("Account created successfully!");
//         window.location.href = `/verifyEmail?email=${value.email}`;
//       } catch (error: any) {
//         const msg =
//           error?.response?.data?.message ||
//           error?.message ||
//           "Something went wrong. Please try again.";

//         setServerError(msg);
//         toast.error(msg);
//       }
//     },
//   });

//   // Email Availability Check (debounced)
//   useEffect(() => {
//   const email = form.state.values.email;
//   if (!email) return;

//   let active = true;

//   // microtask queue → no synchronous setState
//   Promise.resolve().then(() => {
//     if (active) setEmailStatus("checking");
//   });

//   const timer = setTimeout(async () => {
//     const res = await emailAvailabilityAction(email);

//     if (!active) return;

//     setEmailStatus(res.success ? "ok" : "exists");
//   }, 500);

//   return () => {
//     active = false;
//     clearTimeout(timer);
//   };
// }, [form.state.values.email]);


//   // Password Strength Meter
// const passwordStrength = useMemo(() => {
//   return checkStrength(form.state.values.password);
// }, [form.state.values.password]);

//   return (
//     <Card className="w-full max-w-md mx-auto shadow-md">
//       <CardHeader className="text-center">
//         <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
//         <CardDescription>Join ConsultEdge today</CardDescription>
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
//           {/* Full Name */}
//           <form.Field
//             name="fullName"
//             validators={{ onChange: registerZodSchema.shape.fullName }}
//           >
//             {(field) => (
//               <AppField
//                 field={field}
//                 label="Full Name"
//                 placeholder="Enter your full name"
//               />
//             )}
//           </form.Field>

//           {/* Email */}
//           <form.Field
//             name="email"
//             validators={{ onChange: registerZodSchema.shape.email }}
//           >
//             {(field) => (
//               <div>
//                 <AppField
//                   field={field}
//                   label="Email"
//                   type="email"
//                   placeholder="Enter your email"
//                 />

//                 {emailStatus === "checking" && (
//                   <p className="text-sm text-blue-500">Checking availability…</p>
//                 )}
//                 {emailStatus === "exists" && (
//                   <p className="text-sm text-red-500">Email already exists</p>
//                 )}
//                 {emailStatus === "ok" && (
//                   <p className="text-sm text-green-600">Email available</p>
//                 )}
//               </div>
//             )}
//           </form.Field>

//           {/* Password */}
//           <form.Field
//             name="password"
//             validators={{ onChange: registerZodSchema.shape.password }}
//           >
//             {(field) => (
//               <div>
//                 <AppField
//                   field={field}
//                   label="Password"
//                   type="password"
//                   placeholder="Create a password"
//                 />

//                 {/* Password Strength Meter */}
//                 <div className="h-2 mt-1 rounded bg-gray-200">
//                   <div
//                     className={`h-full rounded ${
//                       passwordStrength === "weak"
//                         ? "bg-red-500 w-1/4"
//                         : passwordStrength === "medium"
//                         ? "bg-yellow-500 w-2/4"
//                         : "bg-green-600 w-full"
//                     }`}
//                   />
//                 </div>
//                 <p
//                   className={`text-sm ${
//                     passwordStrength === "weak"
//                       ? "text-red-500"
//                       : passwordStrength === "medium"
//                       ? "text-yellow-600"
//                       : "text-green-600"
//                   }`}
//                 >
//                   {passwordStrength.toUpperCase()}
//                 </p>
//               </div>
//             )}
//           </form.Field>

//           {/* Server Error */}
//           {serverError && (
//             <Alert variant="destructive">
//               <AlertDescription>{serverError}</AlertDescription>
//             </Alert>
//           )}

//           {/* Submit Button */}
//           <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
//             {([canSubmit, isSubmitting]) => (
//               <AppSubmitButton
//                 isPending={isSubmitting || isPending}
//                 pendingLabel="Creating account..."
//                 disabled={!canSubmit || emailStatus === "exists"}
//               >
//                 Sign Up
//               </AppSubmitButton>
//             )}
//           </form.Subscribe>
//         </form>
//       </CardContent>

//       <CardFooter className="justify-center border-t pt-4">
//         <p className="text-sm text-muted-foreground">
//           Already have an account{" "}
//           <Link href="/login" className="text-primary font-medium hover:underline">
//             Log In
//           </Link>
//         </p>
//       </CardFooter>
//     </Card>
//   );
// };

// export default RegisterForm;

"use client";

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Register form</h1>
    </div>
  );
}