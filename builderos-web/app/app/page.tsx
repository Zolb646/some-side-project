"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { apiFetch, formatDate } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Dashboard } from "@/lib/types";

export default function DashboardPage() {
  const { t } = useI18n();
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<Dashboard>("/api/dashboard"),
  });

  const counts = dashboardQuery.data?.taskStatusCounts ?? {
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  return (
    <div>
      <PageHeading title={t("dashboard.title")} />

      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatusCount label={t("dashboard.todo")} value={counts.todo} icon={<Circle size={18} />} />
        <StatusCount
          label={t("dashboard.inProgress")}
          value={counts.inProgress}
          icon={<Loader2 size={18} />}
        />
        <StatusCount label={t("dashboard.done")} value={counts.done} icon={<CheckCircle2 size={18} />} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("dashboard.recentProjects")} href="/app/projects">
          {dashboardQuery.data?.recentProjects.length ? (
            <div className="divide-y divide-stone-200">
              {dashboardQuery.data.recentProjects.map((project) => (
                <Link
                  className="block py-3 transition hover:bg-stone-50"
                  href={`/app/projects/${project.id}`}
                  key={project.id}
                >
                  <p className="font-medium text-stone-950">{project.name}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {project.description || t("common.description")}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <Empty loading={dashboardQuery.isLoading} label={t("common.empty")} />
          )}
        </Panel>

        <Panel title={t("dashboard.recentTasks")} href="/app/tasks">
          {dashboardQuery.data?.recentTasks.length ? (
            <div className="divide-y divide-stone-200">
              {dashboardQuery.data.recentTasks.map((task) => (
                <div className="flex items-center justify-between gap-3 py-3" key={task.id}>
                  <div>
                    <p className="font-medium text-stone-950">{task.title}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {t("common.updated")} {formatDate(task.updatedAt)}
                    </p>
                  </div>
                  <StatusPill status={task.status} />
                </div>
              ))}
            </div>
          ) : (
            <Empty loading={dashboardQuery.isLoading} label={t("common.empty")} />
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatusCount({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between text-stone-500">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-stone-950">{title}</h2>
        <Link className="text-emerald-700 hover:text-emerald-900" href={href}>
          <ArrowRight size={18} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ loading, label }: { loading: boolean; label: string }) {
  return <p className="py-8 text-sm text-stone-500">{loading ? "..." : label}</p>;
}
