import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table2,
  BarChart3,
  Shield,
  FileText,
  Filter,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: "Registo de Consultas",
      description:
        "Formulários adaptados à especialidade para registar consultas de forma eficiente",
    },
    {
      icon: Table2,
      title: "Tabela de Consultas",
      description:
        "Visualização completa com paginação, filtros avançados e ações em lote",
    },
    {
      icon: BarChart3,
      title: "Dashboard de Métricas",
      description:
        "Tendências temporais, gráficos de análise e insights valiosos",
    },
    {
      icon: Filter,
      title: "Filtros Avançados",
      description:
        "Filtre e encontre consultas rapidamente com múltiplos critérios",
    },
    {
      icon: TrendingUp,
      title: "Acompanhamento de Marcos",
      description: "Centralize dados e acompanhe o progresso da sua formação",
    },
    {
      icon: Shield,
      title: "Autenticação Segura",
      description: "Login com email/password ou Google, com dados protegidos",
    },
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-background flex min-h-svh flex-col">
        <header className="flex justify-end p-4">
          <ModeToggle />
        </header>
        <main className="flex flex-1 flex-col">
          {/* Hero Section */}
          <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 md:py-20">
            <div className="flex flex-col items-center gap-4 text-center max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                InTrack
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl">
                Ajuda residentes médicos portugueses a acompanhar consultas e
                marcos, permitindo centralizar dados e obter insights valiosos
                de uma única fonte, para que possam focar-se na aprendizagem e
                ajudar doentes em vez de folhas de cálculo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base"
                >
                  <Link to="/register">Criar Conta</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full px-6 py-12 md:py-20 bg-muted/30">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center mb-12">
                Funcionalidades
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={feature.title} className="flex flex-col">
                      <CardHeader>
                        <div className="mb-2">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex flex-col items-center justify-center gap-6 px-6 py-12 md:py-20">
            <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
              <h2 className="text-3xl font-bold">Pronto para começar?</h2>
              <p className="text-lg text-muted-foreground">
                Junte-se aos residentes médicos que já estão a usar o InTrack
                para simplificar o acompanhamento das suas consultas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/register">Criar Conta Grátis</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base"
                >
                  <Link to="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}
