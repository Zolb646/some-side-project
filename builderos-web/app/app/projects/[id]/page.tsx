"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Field, inputClassName, textareaClassName } from "@/components/ui/form";
import { PageHeading } from "@/components/page-heading";
import { apiFetch, formatDate, jsonRequest } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export default function ProjectDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();

  const projectQuery = useQuery({
    queryKey: ["projects", params.id],
    queryFn: () => apiFetch<Project>(`/api/projects/${params.id}`),
  });

  if (projectQuery.isLoading) {
    return <p className="text-sm text-stone-500">{t("common.loading")}</p>;
  }

  if (!projectQuery.data) {
    return <p className="text-sm text-stone-500">{t("common.empty")}</p>;
  }

  return <ProjectDetailForm key={projectQuery.data.id} project={projectQuery.data} />;
}

function ProjectDetailForm({ project }: { project: Project }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: project.name,
    description: project.description ?? "",
  });

  const saveMutation = useMutation({
    mutationFn: () => jsonRequest<Project>(`/api/projects/${project.id}`, "PUT", form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div>
      <PageHeading title={t("projects.detail")} />
      <section className="max-w-2xl rounded-lg border border-stone-200 bg-white p-4">
        <p className="mb-5 text-sm text-stone-500">
          {t("common.updated")} {formatDate(project.updatedAt)}
        </p>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label={t("projects.name")}>
            <input
              className={inputClassName}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </Field>
          <Field label={t("common.description")}>
            <textarea
              className={textareaClassName}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </Field>
          <div>
            <Button disabled={saveMutation.isPending}>{t("common.save")}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
