"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";
import { I18nProvider } from "@/lib/i18n";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  const content = useMemo(() => children, [children]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{content}</I18nProvider>
    </QueryClientProvider>
  );
}
