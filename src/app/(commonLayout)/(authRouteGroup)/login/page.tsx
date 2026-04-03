import LoginForm from "@/components/modules/auth/loginForm";

interface LoginParams {
  searchParams: Promise<{ redirect?: string }>;
}

const LoginPage = async ({ searchParams }: LoginParams) => {
  const params = await searchParams;
  const redirectPath = params.redirect;
  return (
   
     <LoginForm redirectPath={redirectPath}/>
  )
}

export default LoginPage