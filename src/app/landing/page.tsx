import { ThemeProvider } from "@/components/theme/theme-provider";

import { HeroSection } from "@/components/ui/hero-section";
import { NavbarLanding } from "@/components/ui/navbar-landing";
import { FeaturesSection } from "@/components/ui/features-section";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative min-h-svh flex flex-col overflow-hidden">
        <NavbarLanding />
        <main className="flex flex-1 flex-col">
          <HeroSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* CTA Section */}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
