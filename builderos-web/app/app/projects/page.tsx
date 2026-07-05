"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClassName, textareaClassName } from "@/components/ui/form";
import { PageHeading } from "@/components/page-heading";
import { apiFetch, formatDate, jsonRequest } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { PageResponse, Project } from "@/lib/types";

const emptyProject = { name: "", description: "" };

export default function ProjectsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyProject);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<PageResponse<Project>>("/api/projects"),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? jsonRequest<Project>(`/api/projects/${editing.id}`, "PUT", form)
        : jsonRequest<Project>("/api/projects", "POST", form),
    onSuccess: async () => {
      setEditing(null);
      setForm(emptyProject);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jsonRequest<{ ok: boolean }>(`/api/projects/${id}`, "DELETE"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const startEdit = (project: Project) => {
    setEditing(project);
    setForm({ name: project.name, description: project.description ?? "" });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div>
      <PageHeading title={t("projects.title")} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-4" onSubmit={onSubmit}>
          <h2 className="mb-4 font-semibold text-stone-950">
            {editing ? t("common.edit") : t("projects.new")}
          </h2>
          <div className="grid gap-4">
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
            <div className="flex gap-2">
              <Button disabled={saveMutation.isPending}>
                <Plus size={16} />
                {editing ? t("common.save") : t("common.create")}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyProject);
                  }}
                >
                  {t("common.cancel")}
                </Button>
              ) : null}
            </div>
          </div>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white">
          <div className="divide-y divide-stone-200">
            {projectsQuery.data?.items.map((project) => (
              <article className="grid gap-4 p-4 md:grid-cols-[1fr_auto]" key={project.id}>
                <div>
                  <h2 className="font-semibold text-stone-950">{project.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">{project.description}</p>
                  <p className="mt-3 text-xs text-stone-500">
                    {t("common.updated")} {formatDate(project.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(project)}>
                    {t("common.edit")}
                  </Button>
                  <Link href={`/app/projects/${project.id}`}>
                    <Button type="button" variant="ghost" size="sm">
                      <ExternalLink size={15} />
                      {t("projects.open")}
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(project.id)}
                  >
                    <Trash2 size={15} />
                    {t("common.delete")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!projectsQuery.data?.items.length ? (
            <p className="p-8 text-sm text-stone-500">
              {projectsQuery.isLoading ? t("common.loading") : t("common.empty")}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
