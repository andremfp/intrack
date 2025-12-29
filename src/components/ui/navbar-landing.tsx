"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useResolvedTheme } from "@/hooks/theme/use-resolved-theme";
import { Link } from "react-router-dom";

export const NavbarLanding = () => {
  const resolvedTheme = useResolvedTheme();
  const logoSrc =
    resolvedTheme === "dark"
      ? "/intrack-icon-dark.svg"
      : "/intrack-icon-light.svg";

  return (
    <nav className="relative z-20 flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 shadow-sm backdrop-blur-lg bg-[color:var(--landing-nav-background)] dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <img src={logoSrc} alt="InTrack Logo" className="size-7" />
        <h1 className="text-base font-bold md:text-2xl">InTrack</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
          className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          asChild
        >
          <Link to="/login">Login</Link>
        </Button>
        <ModeToggle />
      </div>
    </nav>
  );
};
