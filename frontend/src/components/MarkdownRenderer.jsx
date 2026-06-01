import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import toast from "react-hot-toast";

// Helper to escape HTML characters securely
const escapeHtml = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

// Custom lightweight syntax highlighter
function highlightCode(code, lang) {
  if (!code) return "";
  const escaped = escapeHtml(code);
  if (!lang) return escaped;

  const language = lang.toLowerCase();
  let html = escaped;

  if (["javascript", "js", "typescript", "ts", "python", "py", "json", "sql"].includes(language)) {
    // Strings
    html = html.replace(/(&quot;.*?&quot;|'.*?'|`[\s\S]*?`)/g, '<span class="text-emerald-500 dark:text-emerald-400 font-medium">$1</span>');
    // Comments
    html = html.replace(/(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-400 dark:text-slate-500 italic">$1</span>');
    // Keywords
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|class|import|export|from|def|try|except|finally|with|select|insert|update|delete|where|join|from|and|or|not|null|true|false)\b/g;
    html = html.replace(keywords, '<span class="text-rose-500 dark:text-rose-400 font-semibold">$1</span>');
    // Numbers
    html = html.replace(/\b(\d+)\b/g, '<span class="text-amber-500 font-medium">$1</span>');
    // Functions
    html = html.replace(/\b(\w+)(?=\()/g, '<span class="text-blue-500 dark:text-blue-400 font-medium">$1</span>');
  } else if (["html", "xml"].includes(language)) {
    // Tags
    html = html.replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="text-rose-500 dark:text-rose-400">$1</span>');
    html = html.replace(/(\/?&gt;)/g, '<span class="text-rose-500 dark:text-rose-400">$1</span>');
    // Attributes
    html = html.replace(/(\s[a-zA-Z0-9:-]+=)/g, '<span class="text-amber-500">$1</span>');
    // Strings
    html = html.replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="text-emerald-500">$1</span>');
  }

  return html;
}

// Inline element parser
function parseInline(text) {
  if (!text) return "";

  // Matches bold (**), italic (*), inline code (`), and links ([text](url))
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  const parts = [];
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const before = text.substring(lastIndex, match.index);
    if (before) {
      parts.push(before);
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={keyIndex++} className="font-bold text-slate-900 dark:text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic
      parts.push(
        <em key={keyIndex++} className="italic text-slate-800 dark:text-slate-200">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Inline Code
      parts.push(
        <code
          key={keyIndex++}
          className="rounded bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 px-1 py-0.5 font-mono text-[11px] text-brand-500 font-semibold"
        >
          {match[5]}
        </code>
      );
    } else if (match[6]) {
      // Link
      parts.push(
        <a
          key={keyIndex++}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-600 underline font-medium transition-colors"
        >
          {match[6]}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  const after = text.substring(lastIndex);
  if (after) {
    parts.push(after);
  }

  return parts.length > 0 ? parts : text;
}

// Sub-component for premium Code Block rendering
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const highlightedHtml = highlightCode(code, language);

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-[#0f0f16] shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#161622] px-4 py-2 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-slate-500" />
          <span>{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
          title="Copy Code"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
        <pre className="text-slate-300">
          <code
            className={`language-${language || "text"}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}

// Markdown Preprocessor & Normalizer
function normalizeMarkdown(text) {
  if (!text) return "";

  let cleaned = text;

  // 1. Unescape escaped double quotes and other escaped quote sequences
  cleaned = cleaned.replace(/\\"/g, '"').replace(/\\'/g, "'");

  // 2. Clean leaked blockquote symbols prefixing bullets/lists:
  // e.g. "> - Bullet" -> "- Bullet"
  // e.g. "> 1. Step" -> "1. Step"
  // Also handle double blockquotes like "> > text" -> "> text"
  cleaned = cleaned
    .split("\n")
    .map((line) => {
      let trimmed = line.trim();
      // If double blockquote:
      if (trimmed.startsWith("> >")) {
        return trimmed.substring(2).trim();
      }
      // If blockquote followed by list item:
      if (/^&gt;\s*[-*•\d+]/.test(trimmed)) {
        return trimmed.replace(/^&gt;\s*/, "");
      }
      if (/^>\s*[-*•\d+]/.test(trimmed)) {
        return trimmed.replace(/^>\s*/, "");
      }
      return line;
    })
    .join("\n");

  // 3. Remove double markdown bold blocks like "****" -> "**"
  cleaned = cleaned.replace(/\*\*\*\*/g, "**");

  return cleaned;
}

// Main Markdown Renderer Component
export default function MarkdownRenderer({ content }) {
  const normalized = normalizeMarkdown(content);
  const lines = normalized.split("\n");

  const blocks = [];
  let currentBlockType = null; // "paragraph", "code", "table", "list-bullet", "list-number", "blockquote"
  let currentBlockLines = [];
  let codeLanguage = "";

  const flushBlock = () => {
    if (currentBlockLines.length === 0) return;

    const blockText = currentBlockLines.join("\n");
    const key = `block-${blocks.length}`;

    if (currentBlockType === "code") {
      blocks.push(<CodeBlock key={key} code={blockText} language={codeLanguage} />);
    } else if (currentBlockType === "table") {
      const rows = currentBlockLines.map((l) =>
        l.split("|").map((cell) => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      // Parse headers
      const headers = rows[0] || [];
      // Rows[1] is alignment separators (e.g. :---, ---:)
      const alignments = (rows[1] || []).map((align) => {
        if (align.startsWith(":") && align.endsWith(":")) return "center";
        if (align.endsWith(":")) return "right";
        return "left";
      });

      const bodyRows = rows.slice(2);

      blocks.push(
        <div key={key} className="my-4 w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                {headers.map((th, index) => (
                  <th
                    key={index}
                    style={{ textAlign: alignments[index] || "left" }}
                    className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200"
                  >
                    {parseInline(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/20">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{ textAlign: alignments[cIdx] || "left" }}
                      className="px-4 py-2.5 text-slate-600 dark:text-slate-300"
                    >
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (currentBlockType === "list-bullet") {
      blocks.push(
        <ul key={key} className="my-3 list-disc space-y-1.5 pl-6 text-slate-600 dark:text-slate-350">
          {currentBlockLines.map((li, index) => (
            <li key={index} className="leading-relaxed">
              {parseInline(li)}
            </li>
          ))}
        </ul>
      );
    } else if (currentBlockType === "list-number") {
      blocks.push(
        <ol key={key} className="my-3 list-decimal space-y-1.5 pl-6 text-slate-600 dark:text-slate-350">
          {currentBlockLines.map((li, index) => (
            <li key={index} className="leading-relaxed">
              {parseInline(li)}
            </li>
          ))}
        </ol>
      );
    } else if (currentBlockType === "blockquote") {
      blocks.push(
        <blockquote
          key={key}
          className="my-3 border-l-4 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 px-4 py-2 text-slate-600 dark:text-slate-400 italic"
        >
          {parseInline(blockText)}
        </blockquote>
      );
    } else if (currentBlockType === "paragraph") {
      blocks.push(
        <p key={key} className="my-2 leading-relaxed text-slate-600 dark:text-slate-300">
          {parseInline(blockText)}
        </p>
      );
    }

    currentBlockLines = [];
    currentBlockType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Handle Code Block start/end
    if (trimmed.startsWith("```")) {
      if (currentBlockType === "code") {
        flushBlock();
      } else {
        flushBlock();
        currentBlockType = "code";
        codeLanguage = trimmed.substring(3).trim();
      }
      continue;
    }

    // If inside code block, gather lines
    if (currentBlockType === "code") {
      currentBlockLines.push(line);
      continue;
    }

    // 2. Handle Empty Lines
    if (!trimmed) {
      flushBlock();
      continue;
    }

    // 3. Handle Headings
    if (trimmed.startsWith("#")) {
      flushBlock();
      const level = Math.min(6, (trimmed.match(/^#+/) || [""])[0].length);
      const headingText = trimmed.replace(/^#+\s*/, "");
      const headingKey = `heading-${i}`;

      const headingClasses = {
        1: "mt-5 mb-3 text-2xl font-black text-slate-950 dark:text-white tracking-tight",
        2: "mt-4 mb-2.5 text-xl font-extrabold text-slate-950 dark:text-white tracking-tight",
        3: "mt-3.5 mb-2 text-lg font-bold text-slate-900 dark:text-slate-100",
        4: "mt-3 mb-1.5 text-base font-bold text-slate-800 dark:text-slate-100",
        5: "mt-2.5 mb-1.5 text-sm font-bold text-slate-800 dark:text-slate-200",
        6: "mt-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",
      }[level];

      const Tag = `h${level}`;
      blocks.push(
        <Tag key={headingKey} className={headingClasses}>
          {parseInline(headingText)}
        </Tag>
      );
      continue;
    }

    // 4. Handle Blockquotes
    if (trimmed.startsWith(">")) {
      if (currentBlockType !== "blockquote") {
        flushBlock();
        currentBlockType = "blockquote";
      }
      currentBlockLines.push(trimmed.substring(1).trim());
      continue;
    }

    // 5. Handle Tables
    if (trimmed.startsWith("|")) {
      if (currentBlockType !== "table") {
        flushBlock();
        currentBlockType = "table";
      }
      currentBlockLines.push(trimmed);
      continue;
    }

    // 6. Handle Unordered Lists
    if (/^[-*•]\s+/.test(trimmed)) {
      if (currentBlockType !== "list-bullet") {
        flushBlock();
        currentBlockType = "list-bullet";
      }
      currentBlockLines.push(trimmed.replace(/^[-*•]\s+/, ""));
      continue;
    }

    // 7. Handle Ordered Lists
    if (/^\d+\.\s+/.test(trimmed)) {
      if (currentBlockType !== "list-number") {
        flushBlock();
        currentBlockType = "list-number";
      }
      currentBlockLines.push(trimmed.replace(/^\d+\.\s+/, ""));
      continue;
    }

    // 8. Default to Paragraph
    if (currentBlockType && currentBlockType !== "paragraph") {
      flushBlock();
    }
    currentBlockType = "paragraph";
    currentBlockLines.push(line);
  }

  flushBlock();

  return <div className="space-y-1.5">{blocks}</div>;
}
