import { ThemeProvider } from "@/components/theme/theme-provider";
import { SubtleBackground } from "@/components/ui/subtle-background";

import { HeroSection } from "@/components/ui/hero-section";
import { NavbarLanding } from "@/components/ui/navbar-landing";
import { FeaturesSection } from "@/components/ui/features-section";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SubtleBackground variant="landing">
        <NavbarLanding />
        <main className="flex flex-1 flex-col">
          <HeroSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* CTA Section */}
        </main>
        <Footer />
      </SubtleBackground>
    </ThemeProvider>
  );
}
