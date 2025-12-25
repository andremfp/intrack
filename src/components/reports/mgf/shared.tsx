import type { ReactNode } from "react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SCROLLBAR_CLASSES } from "@/constants";

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
  const [isOpen, setIsOpen] = useState(false);
  const isExpanded = isOpen;

  return (
    <section className="rounded-lg border border-border/50 bg-background/40">
      <Collapsible open={isExpanded} onOpenChange={setIsOpen}>
        <div className="flex flex-col">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={isExpanded ? `Ocultar ${title}` : `Expandir ${title}`}
              aria-expanded={isExpanded}
              className="flex w-full items-start justify-between gap-4 px-4 py-2 text-left cursor-pointer"
            >
              <div className="space-y-1 text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground pt-2">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-sm font-semibold text-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
              <span className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                <span className="sr-only">
                  {isExpanded ? `Ocultar ${title}` : `Expandir ${title}`}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 px-4 pb-4 pt-0 space-y-6 text-foreground">
            {children}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </section>
  );
}

interface BreakdownItem {
  key?: string;
  label: string;
  value: ReactNode;
  helper?: string;
  kind?: "autonomy" | "type";
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
  const shouldScroll = items.length > 10;
  const scrollClasses = shouldScroll
    ? `max-h-[26rem] overflow-y-auto ${SCROLLBAR_CLASSES}`
    : "";

  return (
    <div
      className={`divide-y divide-border/50 rounded-lg border border-border/50 bg-muted/10 text-foreground ${
        className ?? ""
      }`}
    >
      <div className={scrollClasses}>
        {items.map((item, index) => (
          <div key={item.key ?? `${item.label}-${index}`} className="px-3 py-2">
            <div
              className={`flex items-center justify-between gap-2 ${textSize} text-foreground`}
            >
              <span className="truncate">
                {item.kind === "autonomy" ? "Autonomia " : ""}
                {item.label}
              </span>
              <span className="font-semibold">{item.value}</span>
            </div>
            {item.helper && (
              <p className="text-[0.6rem] text-muted-foreground">
                {item.helper}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
