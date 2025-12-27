import * as React from "react";

import { cn } from "@/utils/utils";
import { useResolvedTheme } from "@/hooks/theme/use-resolved-theme";

type LogoVariant = "full" | "icon";

const LOGO_SOURCES: Record<"light" | "dark", Record<LogoVariant, string>> = {
  light: {
    full: "/intrack-logo-light.svg",
    icon: "/intrack-icon-light.svg",
  },
  dark: {
    full: "/intrack-logo-dark.svg",
    icon: "/intrack-icon-dark.svg",
  },
};

export type AppLogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  variant?: LogoVariant;
};

export function AppLogo({
  variant = "full",
  className,
  alt = "InTrack",
  ...rest
}: AppLogoProps) {
  const resolvedTheme = useResolvedTheme();
  const src =
    LOGO_SOURCES[resolvedTheme]?.[variant] ?? LOGO_SOURCES.dark[variant];

  return (
    <img
      src={src}
      alt={alt}
      className={cn("block select-none", className)}
      {...rest}
    />
  );
}
