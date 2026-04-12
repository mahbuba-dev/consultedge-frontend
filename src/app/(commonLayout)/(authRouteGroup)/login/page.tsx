import LoginForm from "@/components/modules/auth/loginForm";

interface LoginParams {
  searchParams: Promise<{ redirect?: string; passwordReset?: string }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;
  const passwordReset = params.passwordReset === "true";
  return (
   
     <LoginForm redirectPath={redirectPath} passwordReset={passwordReset} />
  )
}

export default LoginPage