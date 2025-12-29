"use client";

import { cn } from "@/utils/utils";
import type { ReactNode } from "react";

interface GradientBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const GradientBackground = ({
  className,
  children,
  ...props
}: GradientBackgroundProps) => {
  return (
    <div className={cn("relative gradient-bg", className)} {...props}>
      {children}
    </div>
  );
};
