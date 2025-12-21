import type { ReactNode } from "react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReportSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ReportSection({
  title,
  subtitle,
  children,
}: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="rounded-lg border border-border/50 bg-background/40 p-4">
      <Collapsible defaultOpen onOpenChange={setIsOpen}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {title}
            </p>
            {subtitle && (
              <p className="text-sm font-semibold text-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={isOpen ? `Ocultar ${title}` : `Expandir ${title}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition hover:border-border"
            >
              <span className="sr-only">
                {isOpen ? `Ocultar ${title}` : `Expandir ${title}`}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-4 space-y-6 text-foreground">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

interface BreakdownItem {
  key?: string;
  label: string;
  value: ReactNode;
  helper?: string;
}

interface BreakdownListProps {
  items: BreakdownItem[];
  size?: "sm" | "xs";
  className?: string;
}

export function BreakdownList({
  items,
  size = "sm",
  className,
}: BreakdownListProps) {
  if (!items.length) {
    return null;
  }

  const textSize = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div
      className={`divide-y divide-border/50 rounded-lg border border-border/50 bg-muted/10 text-foreground ${
        className ?? ""
      }`}
    >
      {items.map((item, index) => (
        <div key={item.key ?? `${item.label}-${index}`} className="px-3 py-2">
          <div
            className={`flex items-center justify-between gap-2 ${textSize} text-foreground`}
          >
            <span className="truncate">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
          {item.helper && (
            <p className="text-[0.6rem] text-muted-foreground">{item.helper}</p>
          )}
        </div>
      ))}
    </div>
  );
}
