import { useState } from "react";

import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase";
import { toasts } from "@/utils/toasts";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();

    if (!email) {
      setError("Por favor, introduz o teu email");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toasts.success(
        "Email enviado",
        "Verifica a tua caixa de entrada para redefinir a tua password"
      );
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Não foi possível enviar o email de recuperação";

      // Check if error indicates OAuth-only user
      const lowerMessage = errorMessage.toLowerCase();
      if (
        lowerMessage.includes("email not confirmed") ||
        lowerMessage.includes("user not found") ||
        lowerMessage.includes("no email")
      ) {
        const message =
          "Este email está associado a uma conta Google. Por favor, utiliza o login com Google.";
        setError(message);
        toasts.error("Conta Google", message);
      } else {
        setError(errorMessage);
        toasts.error("Erro", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Email enviado</h1>
            <FieldDescription className="text-center">
              Verifica a tua caixa de entrada. Enviámos um link para redefinir a
              sua password.
            </FieldDescription>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Se não recebereste o email em alguns minutos, verifica a pasta de
              spam.
            </FieldDescription>
          </div>
          <Field>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitted(false)}
            >
              Enviar novo email
            </Button>
          </Field>
          <FieldDescription className="text-center">
            <a href="/login" className="underline-offset-4 hover:underline">
              Voltar ao login
            </a>
          </FieldDescription>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Recuperar password</h1>
            <FieldDescription className="text-center">
              Introduz o teu email e enviaremos um link para redefinir uma nova
              password.
            </FieldDescription>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Nota: Esta funcionalidade é para contas criadas com
              email/password. Se criaste a conta com Google, utiliza o login com
              Google.
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "A enviar..." : "Enviar link de recuperação"}
            </Button>
          </Field>
          {error ? (
            <FieldDescription className="text-center text-destructive">
              {error}
            </FieldDescription>
          ) : null}
          <FieldDescription className="text-center">
            <a href="/login" className="underline-offset-4 hover:underline">
              Voltar ao login
            </a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
