import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppLogo } from "@/components/ui/logo";
import { IconX, IconBrandGithub } from "@tabler/icons-react";

export function AboutModal({ onClose }: { onClose: () => void }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md border-border shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/80 absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <IconX className="h-4 w-4" />
        </Button>

        <CardContent className="p-0">
          {/* Header */}
          <div className="relative pt-8 pb-6 px-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center ring-1 ring-border shadow-md">
                  <AppLogo
                    variant="icon"
                    className="h-10 w-10 select-none"
                    aria-hidden="true"
                    alt=""
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">InTrack</h2>
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-3 py-1"
                >
                  Versão {import.meta.env.PACKAGE_VERSION}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Plataforma de gestão e acompanhamento de consultas médicas para
                médicos internos de formação.
              </p>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="px-6 py-6 space-y-4">
            {/* GitHub Link */}
            <div className="flex items-center justify-center">
              <a
                href="https://github.com/andremfp/intrack"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="h-12 w-12 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <IconBrandGithub size={24} stroke={1.5} />
              </a>
            </div>

            {/* Year */}
            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                InTrack · {currentYear}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
