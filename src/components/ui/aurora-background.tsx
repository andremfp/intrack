"use client";
import { cn } from "@/utils/utils";
import type { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900",
          className
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              "--aurora":
                "repeating-linear-gradient(100deg,oklch(0.55 0.2 240)_10%,oklch(0.75 0.15 260)_15%,oklch(0.75 0.12 230)_20%,oklch(0.85 0.08 280)_25%,oklch(0.65 0.18 240)_30%)",
              "--dark-gradient":
                "repeating-linear-gradient(100deg,oklch(0 0 0)_0%,oklch(0 0 0)_7%,transparent_10%,transparent_12%,oklch(0 0 0)_16%)",
              "--white-gradient":
                "repeating-linear-gradient(100deg,oklch(1 0 0)_0%,oklch(1 0 0)_7%,transparent_10%,transparent_12%,oklch(1 0 0)_16%)",

              "--blue-300": "oklch(0.75 0.12 230)",
              "--blue-400": "oklch(0.65 0.18 240)",
              "--blue-500": "oklch(0.55 0.2 240)",
              "--indigo-300": "oklch(0.75 0.15 260)",
              "--violet-200": "oklch(0.85 0.08 280)",
              "--black": "oklch(0 0 0)",
              "--white": "oklch(1 0 0)",
              "--transparent": "transparent",
            } as React.CSSProperties
          }
        >
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
