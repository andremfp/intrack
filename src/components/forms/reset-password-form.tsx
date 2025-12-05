import { GalleryVerticalEnd, Eye, EyeOff, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { cn, validatePasswordCriteria, isPasswordValid } from "@/utils/utils";
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

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordCriteria = validatePasswordCriteria(password);

  // Verify the reset token from URL hash on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Supabase sends tokens in URL hash fragments
        // We need to extract and verify them
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        // Check if this is a password recovery flow
        if (type === "recovery" && accessToken) {
          // Set the session with the recovery token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });

          if (error) throw error;

          if (data.session) {
            setIsValidToken(true);
            // Clear the hash from URL for security
            window.history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );
          } else {
            throw new Error("Sessão inválida");
          }
        } else {
          // No valid token found
          setIsValidToken(false);
          setError(
            "Link inválido ou expirado. Por favor, solicita um novo link de recuperação."
          );
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : typeof e === "object" && e !== null && "message" in e
            ? String((e as { message?: unknown }).message)
            : "Erro ao verificar o link de recuperação";
        setError(message);
        setIsValidToken(false);
        toasts.error("Erro", message);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const form = new FormData(e.currentTarget);
    const passwordValue = String(form.get("password") || "");
    const confirmPasswordValue = String(form.get("confirmPassword") || "");

    if (!isPasswordValid(passwordValue)) {
      setError("A password não cumpre os critérios de segurança");
      setIsLoading(false);
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      setError("As passwords não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: passwordValue,
      });

      if (error) throw error;

      toasts.success("Password atualizada", "Password redefinida com sucesso");

      // Sign out to force re-login with new password
      await supabase.auth.signOut();

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Não foi possível redefinir a password";
      setError(message);
      toasts.error("Erro", message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerifying) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="text-xl font-bold">A verificar...</h1>
            <FieldDescription className="text-center">
              A verificar o link de recuperação
            </FieldDescription>
          </div>
        </FieldGroup>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <h1 className="text-xl font-bold">Link inválido</h1>
            <FieldDescription className="text-center text-destructive">
              {error ||
                "Este link de recuperação é inválido ou expirou. Por favor, solicita um novo link."}
            </FieldDescription>
            <Field>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/forgot-password", { replace: true })}
              >
                Solicitar novo link
              </Button>
            </Field>
            <FieldDescription className="text-center">
              <a href="/" className="underline-offset-4 hover:underline">
                Voltar ao login
              </a>
            </FieldDescription>
          </div>
        </FieldGroup>
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
            <h1 className="text-xl font-bold">Redefinir password</h1>
            <FieldDescription className="text-center">
              Introduz a tua nova password
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="password">Nova password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isLoading}
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
                  <div className="flex items-center gap-1.5">
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
                  </div>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <div className="flex items-center gap-1.5">
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
                  </div>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <div className="flex items-center gap-1.5">
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
                  </div>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <div className="flex items-center gap-1.5">
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
                  </div>
                </FieldDescription>
                <FieldDescription className="text-xs">
                  <div className="flex items-center gap-1.5">
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
                  </div>
                </FieldDescription>
              </div>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirmar nova password
            </FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                disabled={isLoading}
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <FieldDescription className="text-destructive text-xs">
                As passwords não coincidem
              </FieldDescription>
            )}
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "A atualizar..." : "Redefinir password"}
            </Button>
          </Field>
          {error ? (
            <FieldDescription className="text-center text-destructive">
              {error}
            </FieldDescription>
          ) : null}
        </FieldGroup>
      </form>
    </div>
  );
}
