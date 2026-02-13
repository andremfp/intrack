import { IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const version = import.meta.env.PACKAGE_VERSION || "0.1.1";

  return (
    <footer className="dark border-t border-neutral-800 bg-[color:var(--landing-footer-background)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          {/* Logo and Description */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src="/intrack-icon-dark.svg"
                alt="InTrack Logo"
                className="size-6"
              />
              <h3 className="text-lg font-bold text-[color:var(--foreground)]">
                InTrack
              </h3>
            </div>
            <p className="text-sm text-[color:var(--muted-foreground)] max-w-md">
              Plataforma de gestão de consultas para internos de medicina.
            </p>
          </div>

          {/* Links and Info */}
          <div className="flex flex-col items-center gap-1">
            {/* Social Links */}
            <div className="flex items-center mb-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                <a
                  href="https://github.com/andremfp/intrack"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Repository"
                >
                  <IconBrandGithub className="size-4" />
                </a>
              </Button>
            </div>
            <span className="text-xs font-normal text-[color:var(--muted-foreground)]">
              Need help?
            </span>
            <a
              href="mailto:contact@intrack.pt"
              className="text-xs text-[color:var(--muted-foreground)] select-all"
            >
              contact@intrack.pt
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-800 pt-4">
          {/* Version and Copyright */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-[color:var(--muted-foreground)]">
              Versão {version}
            </p>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              &copy; {currentYear} InTrack.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
