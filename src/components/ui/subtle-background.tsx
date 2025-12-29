"use client";

import type { ReactNode } from "react";

interface SubtleBackgroundProps {
  children: ReactNode;
  variant?: "auth" | "dashboard" | "landing";
  className?: string;
}

export function SubtleBackground({
  children,
  variant = "auth",
  className = "",
}: SubtleBackgroundProps) {
  const baseClasses = "relative min-h-svh flex flex-col overflow-hidden";

  const getBackgroundClasses = () => {
    switch (variant) {
      case "landing":
      case "auth":
        return `${baseClasses} ${className}`;
      case "dashboard":
        return `relative overflow-hidden ${className}`;
      default:
        return `${baseClasses} ${className}`;
    }
  };

  const renderLandingLayers = () => (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(140deg, var(--landing-gradient-start), var(--landing-gradient-middle), var(--landing-gradient-end))",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--landing-overlay-soft), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 25%, var(--landing-overlay-bright), transparent 65%)",
        }}
      />
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div
          className="absolute top-16 left-10 w-32 h-32 rounded-full blur-[48px]"
          style={{ backgroundColor: "var(--landing-blob-blue)" }}
        />
        <div
          className="absolute top-10 right-16 w-28 h-28 rounded-full blur-[40px]"
          style={{ backgroundColor: "var(--landing-blob-purple)" }}
        />
        <div
          className="absolute bottom-16 left-1/3 w-36 h-36 rounded-full blur-[60px]"
          style={{ backgroundColor: "var(--landing-blob-amber)" }}
        />
      </div>
    </>
  );

  const renderDashboardLayers = () => (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--landing-overlay-soft),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,var(--landing-overlay-bright),transparent_60%)] dark:bg-[radial-gradient(circle_at_75%_80%,rgba(59,130,246,0.05),transparent_60%)]" />
    </>
  );

  return (
    <div className={getBackgroundClasses()}>
      {variant === "dashboard" ? renderDashboardLayers() : renderLandingLayers()}
      <div className="relative z-10 flex flex-col min-h-svh">{children}</div>
    </div>
  );
}

