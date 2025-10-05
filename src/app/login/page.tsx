import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { upsertUser } from "@/lib/api/users";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        try {
          await upsertUser();
          navigate("/dashboard", { replace: true });
        } catch {
          /* ignore */
        }
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
