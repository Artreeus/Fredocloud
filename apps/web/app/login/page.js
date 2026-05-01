import { LoginForm } from "@/components/login-form";

export default function LoginPage({ searchParams }) {
  return <LoginForm redirectTo={searchParams?.redirect || "/dashboard"} />;
}
