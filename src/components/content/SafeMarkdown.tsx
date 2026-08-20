import type { ReactNode } from "react";

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; text: string };

export function parseSafeMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ kind: "paragraph", text });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      if (code) {
        blocks.push({ kind: "code", text: code.join("\n") });
        code = null;
      } else {
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(rawLine);
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", level: heading[1].length as 2 | 3, text: heading[2].trim() });
      continue;
    }

    const item = /^[-*]\s+(.+)$/.exec(line.trim());
    if (item) {
      flushParagraph();
      list.push(item[1].trim());
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  if (code) blocks.push({ kind: "code", text: code.join("\n") });
  flushParagraph();
  flushList();
  return blocks;
}

export function SafeMarkdown({ source, className = "article-copy" }: { source: string; className?: string }) {
  const blocks = parseSafeMarkdown(source);
  const children: ReactNode[] = blocks.map((block, index) => {
    if (block.kind === "heading") {
      const id = `content-heading-${index}`;
      return block.level === 2
        ? <h2 key={id} id={id}>{block.text}</h2>
        : <h3 key={id} id={id}>{block.text}</h3>;
    }
    if (block.kind === "list") {
      return <ul key={`list-${index}`} className="content-list">{block.items.map((item, itemIndex) => <li key={`${index}-${itemIndex}`}>{item}</li>)}</ul>;
    }
    if (block.kind === "code") {
      return <pre key={`code-${index}`} className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200"><code>{block.text}</code></pre>;
    }
    return <p key={`paragraph-${index}`}>{block.text}</p>;
  });

  return <div className={className}>{children}</div>;
}
