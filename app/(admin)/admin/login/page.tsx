import AdminLoginForm from "@/components/admin/login-form";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const errorType = searchParams.error;

  return (
    <main className="flex items-center justify-center min-h-screen bg-canvas py-12 px-6">
      <AdminLoginForm errorType={errorType} />
    </main>
  );
}
