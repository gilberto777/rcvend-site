type FormattedDescriptionProps = {
  value: string;
};

const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "u", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "hr"]);

export function FormattedDescription({ value }: FormattedDescriptionProps) {
  const html = decorateCheckLines(sanitizeDescription(toHtml(value)));

  return (
    <div
      className="formatted-description mt-4 space-y-4 leading-8 text-foreground"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function toHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return trimmed
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const isChecklist = lines.every((line) => /^[✓✔✅☑]\s+/.test(line));
      const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
      const isNumberedList = lines.every((line) => /^\d+\.\s+/.test(line));

      if (isChecklist) {
        return lines.map((line) => `<p>${renderInlineMarkdown(escapeHtml(line))}</p>`).join("");
      }

      if (isBulletList) {
        return `<ul>${lines.map((line) => `<li>${renderInlineMarkdown(escapeHtml(line.replace(/^[-*]\s+/, "")))}</li>`).join("")}</ul>`;
      }

      if (isNumberedList) {
        return `<ol>${lines.map((line) => `<li>${renderInlineMarkdown(escapeHtml(line.replace(/^\d+\.\s+/, "")))}</li>`).join("")}</ol>`;
      }

      if (lines.length === 1 && lines[0].startsWith("## ")) {
        return `<h3>${renderInlineMarkdown(escapeHtml(lines[0].replace(/^##\s+/, "")))}</h3>`;
      }

      return `<p>${lines.map((line) => renderInlineMarkdown(escapeHtml(line))).join("<br>")}</p>`;
    })
    .join("");
}

function sanitizeDescription(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tagName: string) => {
      const tag = tagName.toLowerCase();
      if (!allowedTags.has(tag)) return "";
      if (match.startsWith("</")) return `</${tag}>`;
      return tag === "br" || tag === "hr" ? `<${tag}>` : `<${tag}>`;
    });
}

function decorateCheckLines(value: string) {
  return value
    .replace(
      /<p>\s*<strong>\s*([✓✔✅☑])(?:️)?\s*([^<]*?)<\/strong>\s*([\s\S]*?)<\/p>/g,
      '<p class="flex gap-3"><span class="mt-0.5 shrink-0 text-2xl font-black leading-7 text-[#6b4fc4]">$1</span><span class="text-foreground"><strong>$2</strong>$3</span></p>',
    )
    .replace(
      /<p>\s*([✓✔✅☑])(?:️)?\s*([\s\S]*?)<\/p>/g,
      '<p class="flex gap-3"><span class="mt-0.5 shrink-0 text-2xl font-black leading-7 text-[#6b4fc4]">$1</span><span class="text-foreground">$2</span></p>',
    );
}

function renderInlineMarkdown(value: string) {
  return value
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
