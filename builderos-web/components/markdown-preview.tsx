"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose prose-stone max-w-none text-sm leading-6 text-stone-800">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="mb-3 text-xl font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-4 text-lg font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>,
          p: ({ children }) => <p className="mb-3">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal pl-5">{children}</ol>,
          code: ({ children }) => (
            <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="mb-3 overflow-auto rounded-md bg-stone-950 p-3 text-xs text-stone-50">
              {children}
            </pre>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
