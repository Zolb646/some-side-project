"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/form";
import { ApiClientError, jsonRequest } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { AuthSession } from "@/lib/types";

type Mode = "login" | "register";

export function AuthCard({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      jsonRequest<AuthSession>(`/api/auth/${mode}`, "POST", {
        email,
        displayName: mode === "register" ? displayName : undefined,
        password,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/app");
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : t("errors.generic"));
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  };

  const isRegister = mode === "register";

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-700">{t("app.name")}</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950">
            {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
          </h1>
          <p className="mt-2 text-sm text-stone-600">{t("app.subtitle")}</p>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label={t("auth.email")}>
            <input
              className={inputClassName}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          {isRegister ? (
            <Field label={t("auth.displayName")}>
              <input
                className={inputClassName}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                minLength={2}
                required
              />
            </Field>
          ) : null}

          <Field label={t("auth.password")}>
            <input
              className={inputClassName}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </Field>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button className="w-full" disabled={mutation.isPending}>
            {isRegister ? t("auth.registerAction") : t("auth.loginAction")}
            <ArrowRight size={16} />
          </Button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          {isRegister ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
          <Link
            className="font-medium text-emerald-700 hover:text-emerald-900"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? t("auth.login") : t("auth.register")}
          </Link>
        </p>
      </section>
    </main>
  );
}
