import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LoginForm } from "@/components/forms/login-form";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GradientBackground } from "@/components/ui/gradient-background";
import { AppLogo } from "@/components/ui/logo";
import { supabase } from "@/supabase";

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
      <GradientBackground className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-4">
          <Link to="/">
            <AppLogo variant="icon" className="size-8" />
          </Link>
          <ModeToggle />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </main>
      </GradientBackground>
    </ThemeProvider>
  );
}
