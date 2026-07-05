"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Field, inputClassName, selectClassName, textareaClassName } from "@/components/ui/form";
import { apiFetch, formatDate, jsonRequest } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { PageResponse, Project, Task, TaskStatus } from "@/lib/types";

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const emptyTask = {
  projectId: "",
  title: "",
  description: "",
  status: "TODO" as TaskStatus,
  dueDate: "",
};

export default function TasksPage() {
  const { t, statusLabel } = useI18n();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyTask);

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<PageResponse<Task>>("/api/tasks"),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<PageResponse<Project>>("/api/projects?size=100"),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? jsonRequest<Task>(`/api/tasks/${editing.id}`, "PUT", taskPayload(form))
        : jsonRequest<Task>("/api/tasks", "POST", taskPayload(form)),
    onSuccess: async () => {
      setEditing(null);
      setForm(emptyTask);
      await invalidateTaskData(queryClient);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jsonRequest<{ ok: boolean }>(`/api/tasks/${id}`, "DELETE"),
    onSuccess: async () => invalidateTaskData(queryClient),
  });

  const statusMutation = useMutation({
    mutationFn: ({ task, status }: { task: Task; status: TaskStatus }) =>
      jsonRequest<Task>(`/api/tasks/${task.id}`, "PUT", {
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status,
        dueDate: task.dueDate,
      }),
    onMutate: async ({ task, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<PageResponse<Task>>(["tasks"]);
      queryClient.setQueryData<PageResponse<Task>>(["tasks"], (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === task.id ? { ...item, status } : item,
              ),
            }
          : current,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks"], context.previous);
      }
    },
    onSettled: async () => invalidateTaskData(queryClient),
  });

  const startEdit = (task: Task) => {
    setEditing(task);
    setForm({
      projectId: task.projectId ?? "",
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      dueDate: task.dueDate ?? "",
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div>
      <PageHeading title={t("tasks.title")} />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-4" onSubmit={onSubmit}>
          <h2 className="mb-4 font-semibold text-stone-950">
            {editing ? t("common.edit") : t("tasks.new")}
          </h2>
          <div className="grid gap-4">
            <Field label={t("common.title")}>
              <input
                className={inputClassName}
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </Field>
            <Field label={t("tasks.project")}>
              <select
                className={selectClassName}
                value={form.projectId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectId: event.target.value }))
                }
              >
                <option value="">{t("tasks.noProject")}</option>
                {projectsQuery.data?.items.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("tasks.status")}>
                <select
                  className={selectClassName}
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as TaskStatus,
                    }))
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("tasks.dueDate")}>
                <input
                  className={inputClassName}
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                />
              </Field>
            </div>
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
                    setForm(emptyTask);
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
            {tasksQuery.data?.items.map((task) => (
              <article className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]" key={task.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-stone-950">{task.title}</h2>
                    <StatusPill status={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{task.description}</p>
                  <p className="mt-3 text-xs text-stone-500">
                    {task.dueDate ? `${t("tasks.dueDate")} ${formatDate(task.dueDate)} · ` : ""}
                    {t("common.updated")} {formatDate(task.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      variant={task.status === status ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => statusMutation.mutate({ task, status })}
                    >
                      {task.status === status ? <Check size={14} /> : null}
                      {statusLabel(status)}
                    </Button>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(task)}>
                    {t("common.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(task.id)}
                  >
                    <Trash2 size={15} />
                    {t("common.delete")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!tasksQuery.data?.items.length ? (
            <p className="p-8 text-sm text-stone-500">
              {tasksQuery.isLoading ? t("common.loading") : t("common.empty")}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function taskPayload(form: typeof emptyTask) {
  return {
    projectId: form.projectId || null,
    title: form.title,
    description: form.description || null,
    status: form.status,
    dueDate: form.dueDate || null,
  };
}

async function invalidateTaskData(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}
