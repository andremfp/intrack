import { GalleryVerticalEnd } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
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
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const password = String(form.get("password") || "");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      if (data?.user) {
        console.log("User created, attempting to upsert user profile...");
        try {
          await upsertUser();
          console.log("User profile upserted successfully");
          navigate("/dashboard");
        } catch (upsertError) {
          console.error("Failed to create user profile:", upsertError);
          // Still navigate to dashboard - the user can try again
          navigate("/dashboard");
        }
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
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">InTrack</span>
            </a>
            <h1 className="text-xl font-bold">Bem vindo ao InTrack</h1>
            <h2 className="text-sm">
              {" "}
              Monitorização de consultas para internos de medicina
            </h2>
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
            <Input id="name" name="name" type="text" required />
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
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
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
