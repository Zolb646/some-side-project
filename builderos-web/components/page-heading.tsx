import { ReactNode } from "react";

export function PageHeading({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <h1 className="text-2xl font-semibold text-stone-950">{title}</h1>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}
