import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

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

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const captchaRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
      captchaToken: captchaToken ?? undefined,
    });

    if (import.meta.env.DEV && error) {
      console.error("[ForgotPassword] resetPasswordForEmail error:", error);
    }

    captchaRef.current?.reset();
    setCaptchaToken(null);
    setIsSubmitted(true);
    setIsLoading(false);
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
          <div className="flex justify-center">
            <Turnstile
              ref={captchaRef}
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => setCaptchaToken(null)}
              onExpire={() => setCaptchaToken(null)}
              options={{ theme: "auto" }}
            />
          </div>
          <Field>
            <Button type="submit" disabled={isLoading || !captchaToken}>
              {isLoading ? "A enviar..." : "Enviar link de recuperação"}
            </Button>
          </Field>
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
