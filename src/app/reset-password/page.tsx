import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GradientBackground } from "@/components/ui/gradient-background";
import { AppLogo } from "@/components/ui/logo";

export default function ResetPasswordPage() {
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
            <ResetPasswordForm />
          </div>
        </main>
      </GradientBackground>
    </ThemeProvider>
  );
}
