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
    <div
      className={cn("relative", className)}
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, var(--landing-gradient-start) 0%, var(--landing-gradient-middle) 50%, var(--landing-gradient-end) 100%)",
      }}
      {...props}
    >
      {children}
    </div>
  );
};
