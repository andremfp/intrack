import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/forms/login-form";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Valid session and user exists, redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    })();
  }, [navigate]);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-background flex min-h-svh flex-col">
        <header className="flex justify-end p-4">
          <ModeToggle />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
