import Link from "next/link";
import { AlertTriangle, Info, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { buildHref } from "./seo-ui";

const TABS = [
  { id: "overview", label: "Overview", href: "/dashboard/seo" },
  { id: "keywords", label: "Keywords", href: "/dashboard/seo/keywords" },
  { id: "pages", label: "Landing pages", href: "/dashboard/seo/pages" },
  { id: "technical", label: "Technical", href: "/dashboard/seo/technical" },
  { id: "health", label: "Site health", href: "/dashboard/seo/health" },
] as const;

export type SeoTab = (typeof TABS)[number]["id"];

export function SeoHeader({
  active,
  title,
  subtitle,
  actions,
}: {
  active: SeoTab;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">
            Search performance
          </p>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">{title}</h1>
          <p className="text-sm text-[#647581] mt-1 max-w-2xl">{subtitle}</p>
        </div>
        {actions}
      </div>
      <SeoSubNav active={active} />
    </header>
  );
}

export function SeoSubNav({ active }: { active: SeoTab }) {
  return (
    <nav aria-label="SEO sections" className="flex gap-1 border-b border-[rgba(7,26,40,0.08)] overflow-x-auto">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={t.id === active ? "page" : undefined}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
            t.id === active
              ? "border-[#0088cc] text-[#0088cc]"
              : "border-transparent text-[#647581] hover:text-[#071a28]"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

type NoticeKind = "info" | "warning" | "error" | "denied";

export function SeoNotice({
  kind = "info",
  title,
  children,
}: {
  kind?: NoticeKind;
  title: string;
  children?: React.ReactNode;
}) {
  const styles: Record<NoticeKind, string> = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    denied: "border-[rgba(7,26,40,0.12)] bg-stone-50 text-[#071a28]",
  };
  const Icon = kind === "denied" ? Lock : kind === "info" ? Info : AlertTriangle;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-2xl border p-4 flex gap-3 ${styles[kind]}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="text-sm space-y-1">
        <p className="font-semibold">{title}</p>
        {children && <div className="text-[13px] opacity-90 leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

export function SeoEmptyState({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(7,26,40,0.18)] bg-white p-8 text-center">
      <p className="font-serif text-lg font-bold text-[#071a28]">{title}</p>
      <div className="text-sm text-[#647581] mt-2 max-w-xl mx-auto leading-relaxed">{children}</div>
    </div>
  );
}

export function SeoPermissionDenied() {
  return (
    <SeoNotice kind="denied" title="You don't have access to SEO analytics">
      This area is limited to Admin and Super Admin accounts. Ask a Super Admin if you need access.
    </SeoNotice>
  );
}

export function SeoCard({
  title,
  caption,
  children,
  className = "",
}: {
  title?: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 ${className}`}>
      {title && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[#071a28]">{title}</h2>
          {caption && <p className="text-[11px] text-[#647581] mt-0.5">{caption}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function SeoPagination({
  base,
  params,
  page,
  totalPages,
  total,
}: {
  base: string;
  params: Record<string, string | number | undefined>;
  page: number;
  totalPages: number;
  total: number;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 pt-4 text-xs text-[#647581]">
      <span>
        {total.toLocaleString("en-IN")} result{total === 1 ? "" : "s"} · page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(base, { ...params, page: page - 1 })}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(7,26,40,0.12)] bg-white font-semibold text-[#071a28] hover:bg-stone-50"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" /> Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={buildHref(base, { ...params, page: page + 1 })}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(7,26,40,0.12)] bg-white font-semibold text-[#071a28] hover:bg-stone-50"
          >
            Next <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export function SortHeader({
  label,
  field,
  base,
  params,
  currentSort,
  currentDir,
  align = "right",
}: {
  label: string;
  field: string;
  base: string;
  params: Record<string, string | number | undefined>;
  currentSort: string;
  currentDir: string;
  align?: "left" | "right";
}) {
  const active = currentSort === field;
  const nextDir = active && currentDir === "desc" ? "asc" : "desc";
  return (
    <th
      scope="col"
      aria-sort={active ? (currentDir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-2.5 font-semibold ${align === "right" ? "text-right" : "text-left"}`}
    >
      <Link
        href={buildHref(base, { ...params, sort: field, dir: nextDir, page: 1 })}
        className={`hover:text-[#071a28] ${active ? "text-[#071a28]" : ""}`}
      >
        {label}
        {active ? (currentDir === "asc" ? " ↑" : " ↓") : ""}
      </Link>
    </th>
  );
}
