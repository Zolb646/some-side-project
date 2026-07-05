"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MarkdownPreview } from "@/components/markdown-preview";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Field, inputClassName } from "@/components/ui/form";
import { apiFetch, formatDate, jsonRequest } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Note } from "@/lib/types";

export default function NoteDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();

  const noteQuery = useQuery({
    queryKey: ["notes", params.id],
    queryFn: () => apiFetch<Note>(`/api/notes/${params.id}`),
  });

  if (noteQuery.isLoading) {
    return <p className="text-sm text-stone-500">{t("common.loading")}</p>;
  }

  if (!noteQuery.data) {
    return <p className="text-sm text-stone-500">{t("common.empty")}</p>;
  }

  return <NoteDetailForm key={noteQuery.data.id} note={noteQuery.data} />;
}

function NoteDetailForm({ note }: { note: Note }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: note.title,
    contentMarkdown: note.contentMarkdown,
  });

  const saveMutation = useMutation({
    mutationFn: () => jsonRequest<Note>(`/api/notes/${note.id}`, "PUT", form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      await queryClient.invalidateQueries({ queryKey: ["notes", note.id] });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div>
      <PageHeading title={t("notes.detail")} />
      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <p className="mb-5 text-sm text-stone-500">
          {t("common.updated")} {formatDate(note.updatedAt)}
        </p>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label={t("common.title")}>
            <input
              className={inputClassName}
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </Field>
          <div className="grid gap-4 xl:grid-cols-2">
            <Field label={t("notes.content")}>
              <textarea
                className="min-h-[520px] w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                value={form.contentMarkdown}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contentMarkdown: event.target.value }))
                }
              />
            </Field>
            <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
              <p className="mb-4 text-xs font-medium uppercase text-stone-500">{t("notes.preview")}</p>
              <MarkdownPreview content={form.contentMarkdown} />
            </div>
          </div>
          <div>
            <Button disabled={saveMutation.isPending}>{t("common.save")}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
