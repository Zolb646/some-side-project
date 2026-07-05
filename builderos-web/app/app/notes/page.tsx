"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/form";
import { apiFetch, formatDate, jsonRequest } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Note, PageResponse } from "@/lib/types";

const emptyNote = { title: "", contentMarkdown: "" };

export default function NotesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState(emptyNote);

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiFetch<PageResponse<Note>>("/api/notes"),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? jsonRequest<Note>(`/api/notes/${editing.id}`, "PUT", form)
        : jsonRequest<Note>("/api/notes", "POST", form),
    onSuccess: async () => {
      setEditing(null);
      setForm(emptyNote);
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jsonRequest<{ ok: boolean }>(`/api/notes/${id}`, "DELETE"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const startEdit = (note: Note) => {
    setEditing(note);
    setForm({ title: note.title, contentMarkdown: note.contentMarkdown });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div>
      <PageHeading title={t("notes.title")} />
      <div className="grid gap-6 2xl:grid-cols-[460px_1fr]">
        <form className="rounded-lg border border-stone-200 bg-white p-4" onSubmit={onSubmit}>
          <h2 className="mb-4 font-semibold text-stone-950">
            {editing ? t("common.edit") : t("notes.new")}
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
            <Field label={t("notes.content")}>
              <textarea
                className="min-h-64 w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                value={form.contentMarkdown}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contentMarkdown: event.target.value }))
                }
              />
            </Field>
            <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
              <p className="mb-3 text-xs font-medium uppercase text-stone-500">{t("notes.preview")}</p>
              <MarkdownPreview content={form.contentMarkdown} />
            </div>
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
                    setForm(emptyNote);
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
            {notesQuery.data?.items.map((note) => (
              <article className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]" key={note.id}>
                <div>
                  <h2 className="font-semibold text-stone-950">{note.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                    {note.contentMarkdown || t("common.empty")}
                  </p>
                  <p className="mt-3 text-xs text-stone-500">
                    {t("common.updated")} {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(note)}>
                    {t("common.edit")}
                  </Button>
                  <Link href={`/app/notes/${note.id}`}>
                    <Button type="button" variant="ghost" size="sm">
                      <ExternalLink size={15} />
                      {t("notes.detail")}
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMutation.mutate(note.id)}
                  >
                    <Trash2 size={15} />
                    {t("common.delete")}
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {!notesQuery.data?.items.length ? (
            <p className="p-8 text-sm text-stone-500">
              {notesQuery.isLoading ? t("common.loading") : t("common.empty")}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
