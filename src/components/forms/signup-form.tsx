import { GalleryVerticalEnd, Eye, EyeOff, Check, X, Mail } from "lucide-react";
import { useState } from "react";

import { cn, validatePasswordCriteria, isPasswordValid } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { upsertUser } from "@/lib/api/users";
import { supabase } from "@/supabase";
import { USER_CONSTANTS } from "@/constants";
import { useNavigate } from "react-router-dom";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const passwordCriteria = validatePasswordCriteria(password);

  async function handleGoogleSignup() {
    setError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });

      if (error) throw error;
      // Redirect handled by Supabase; user row will be upserted on return via page effect.
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Ocorreu um erro ao entrar com Google";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const passwordValue = String(form.get("password") || "");

    if (!isPasswordValid(passwordValue)) {
      setError("A password não cumpre os critérios de segurança");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: passwordValue,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // If Supabase returns a session, the user is already logged in and we can
      // immediately create the profile + redirect to dashboard.
      if (data?.user && data.session) {
        console.log(
          "User created with active session, attempting to upsert user profile..."
        );
        const result = await upsertUser();

        if (result.success) {
          console.log("User profile upserted successfully");
          navigate("/dashboard");
        } else {
          console.error("Failed to create user profile:", result.error);
          setError(result.error.userMessage);
        }
        return;
      }

      // If there is a user but NO session, Supabase is asking for email confirmation.
      if (data?.user && !data.session) {
        setEmailConfirmationRequired(true);
        return;
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Não foi possível criar a conta";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }
  // Show success view when email confirmation is required
  if (emailConfirmationRequired) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Mail className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">Verifica o teu email</h1>
            <p className="text-sm text-muted-foreground">
              Enviámos um link de confirmação para o teu email. Clica no link
              para ativar a tua conta e aceder ao InTrack.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button variant="outline" asChild>
              <a href="/login">Ir para o Login</a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Não recebeste o email? Verifica a pasta de spam ou{" "}
              <button
                type="button"
                onClick={() => setEmailConfirmationRequired(false)}
                className="underline underline-offset-4 hover:text-foreground"
              >
                volta à páginal de resgisto
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="text-xl font-bold">Bem vindo ao InTrack</h1>
            <p className="text-sm">
              Monitorização de consultas para internos de medicina
            </p>
          </div>
          <FieldDescription className="text-center">
            Criar conta com Google
          </FieldDescription>
          <Field>
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Criar conta com Google
            </Button>
          </Field>
          <FieldSeparator>Ou continuar com</FieldSeparator>
          <Field>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              required
              maxLength={USER_CONSTANTS.MAX_DISPLAY_NAME_LENGTH}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {password && (
              <div className="space-y-1.5 mt-2">
                <FieldDescription className="text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {passwordCriteria.minLength ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <X className="size-3 text-destructive" />
                    )}
                    <span
                      className={
                        passwordCriteria.minLength
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Pelo menos 8 caracteres
                    </span>
                  </span>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {passwordCriteria.hasUppercase ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <X className="size-3 text-destructive" />
                    )}
                    <span
                      className={
                        passwordCriteria.hasUppercase
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Uma letra maiúscula
                    </span>
                  </span>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {passwordCriteria.hasLowercase ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <X className="size-3 text-destructive" />
                    )}
                    <span
                      className={
                        passwordCriteria.hasLowercase
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Uma letra minúscula
                    </span>
                  </span>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {passwordCriteria.hasNumber ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <X className="size-3 text-destructive" />
                    )}
                    <span
                      className={
                        passwordCriteria.hasNumber
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Um número
                    </span>
                  </span>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {passwordCriteria.hasSpecialChar ? (
                      <Check className="size-3 text-green-600" />
                    ) : (
                      <X className="size-3 text-destructive" />
                    )}
                    <span
                      className={
                        passwordCriteria.hasSpecialChar
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      Um carácter especial (!@#$%^&*...)
                    </span>
                  </span>
                </FieldDescription>
              </div>
            )}
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              Criar conta
            </Button>
          </Field>
          {error ? (
            <FieldDescription className="text-center text-destructive">
              {error}
            </FieldDescription>
          ) : null}
          <FieldDescription className="text-center">
            Já tem uma conta? <a href="/">Login</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
