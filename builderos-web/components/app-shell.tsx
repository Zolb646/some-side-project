"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, FolderKanban, LayoutDashboard, LogOut, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, jsonRequest } from "@/lib/api-client";
import { useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const navItems = [
  { href: "/app", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/app/projects", label: "nav.projects", icon: FolderKanban },
  { href: "/app/tasks", label: "nav.tasks", icon: CheckSquare },
  { href: "/app/notes", label: "nav.notes", icon: NotebookPen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<User>("/api/auth/me"),
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isError) {
      router.replace("/login");
    }
  }, [meQuery.isError, router]);

  const logoutMutation = useMutation({
    mutationFn: () => jsonRequest<{ ok: boolean }>("/api/auth/logout", "POST"),
    onSuccess: async () => {
      queryClient.clear();
      router.replace("/login");
    },
  });

  if (meQuery.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-stone-600">
        {t("common.loading")}
      </div>
    );
  }

  if (meQuery.isError) {
    return null;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-stone-200 bg-stone-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-stone-800">
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:block lg:px-5 lg:py-6">
          <div>
            <p className="text-lg font-semibold tracking-normal">{t("app.name")}</p>
            <p className="mt-1 hidden max-w-48 text-sm text-stone-400 lg:block">{t("app.subtitle")}</p>
          </div>
          <select
            className="h-9 rounded-md border border-stone-700 bg-stone-900 px-2 text-sm text-white outline-none lg:mt-6"
            value={language}
            aria-label={t("common.language")}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            <option value="en">{t("common.english")}</option>
            <option value="mn">{t("common.mongolian")}</option>
          </select>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:grid lg:px-3">
          {navItems.map((item) => {
            const active =
              item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm text-stone-300 transition hover:bg-stone-900 hover:text-white",
                  active && "bg-white text-stone-950 hover:bg-white hover:text-stone-950",
                )}
                href={item.href}
              >
                <Icon size={16} />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-stone-950">{meQuery.data?.displayName}</p>
            <p className="text-xs text-stone-500">{meQuery.data?.email}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} />
            {t("auth.logout")}
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
