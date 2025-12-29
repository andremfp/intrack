import { ModeToggle } from "@/components/theme/mode-toggle";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SubtleBackground } from "@/components/ui/subtle-background";

export default function ForgotPasswordPage() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SubtleBackground variant="auth">
        <header className="flex justify-end p-4">
          <ModeToggle />
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="w-full max-w-sm">
            <ForgotPasswordForm />
          </div>
        </main>
      </SubtleBackground>
    </ThemeProvider>
  );
}
