import { Link, useNavigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect } from "react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GradientBackground } from "@/components/ui/gradient-background";
import { AppLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <GradientBackground className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-4">
          <Link to="/">
            <AppLogo variant="icon" className="size-8" />
          </Link>
          <ModeToggle />
        </header>
        <main className="flex flex-1 flex-col items-center p-6 md:p-10">
          <article className="w-full max-w-3xl prose prose-sm dark:prose-invert">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="not-prose mb-4 gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
            >
              <IconArrowLeft className="size-4" />
              Voltar
            </Button>
            <h1>Termos e Condições de Utilização</h1>
            <p className="text-muted-foreground text-sm">
              Última atualização: 2 de maio de 2026
            </p>

            <h2>1. Sobre o InTrack</h2>
            <p>
              O InTrack é uma plataforma gratuita de registo e monitorização de
              consultas para internos de medicina, disponibilizada por{" "}
              <a href="mailto:contact@intrack.pt">contact@intrack.pt</a>.
            </p>

            <h2>2. Aceitação dos Termos</h2>
            <p>
              Ao criares uma conta e utilizares o InTrack, aceitas estes Termos
              e Condições na sua totalidade. Se não concordares com qualquer
              parte destes termos, não deves utilizar a plataforma.
            </p>

            <h2>3. Quem Pode Utilizar</h2>
            <p>
              O InTrack destina-se a profissionais de saúde — em particular
              internos de medicina — para registo dos seus próprios registos
              clínicos de formação. A utilização é gratuita.
            </p>

            <h2>4. Utilização Aceitável</h2>
            <p>Ao utilizares o InTrack, comprometes-te a:</p>
            <ul>
              <li>
                Introduzir dados verdadeiros e precisos relativamente à tua
                atividade clínica
              </li>
              <li>
                Não introduzir dados pessoais identificativos de doentes (nome,
                número de SNS, ou qualquer outro dado que permita identificar um
                doente)
              </li>
              <li>Não utilizar a plataforma para fins ilegais ou prejudiciais</li>
              <li>Não tentar aceder a dados de outros utilizadores</li>
              <li>
                Não interferir com o funcionamento da plataforma ou das suas
                infraestruturas
              </li>
            </ul>

            <h2>5. Ausência de Responsabilidade Clínica</h2>
            <p>
              O InTrack é uma ferramenta de registo e acompanhamento de
              formação — não é um sistema de apoio à decisão clínica. Não
              assumimos qualquer responsabilidade por decisões clínicas tomadas
              com base em dados registados na plataforma. A utilização do
              InTrack não substitui o julgamento clínico nem a orientação dos
              responsáveis de formação.
            </p>

            <h2>6. Disponibilidade do Serviço</h2>
            <p>
              O InTrack é fornecido "tal como está" (<em>as-is</em>), sem
              garantias de disponibilidade contínua ou ausência de erros. Não
              garantimos qualquer nível de serviço (SLA). Reservamo-nos o
              direito de interromper, modificar ou descontinuar o serviço em
              qualquer momento, com ou sem aviso prévio.
            </p>
            <p>
              Recomendamos que exportes os teus dados regularmente através da
              funcionalidade de exportação disponível na aplicação.
            </p>

            <h2>7. Propriedade Intelectual</h2>
            <p>
              O código-fonte do InTrack está disponível sob a{" "}
              <a
                href="https://github.com/andremfp/intrack/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                licença MIT
              </a>
              . O nome "InTrack", o logótipo e a identidade visual são
              propriedade do responsável pela plataforma e não estão abrangidos
              pela licença MIT — não podem ser utilizados sem autorização prévia.
            </p>

            <h2>8. Suspensão de Conta</h2>
            <p>
              Reservamo-nos o direito de suspender ou eliminar contas que violem
              estes Termos e Condições, sem aviso prévio.
            </p>

            <h2>9. Limitação de Responsabilidade</h2>
            <p>
              Na máxima extensão permitida pela lei aplicável, o InTrack não é
              responsável por quaisquer danos diretos, indiretos, incidentais ou
              consequentes resultantes da utilização ou impossibilidade de
              utilização da plataforma, incluindo perda de dados.
            </p>

            <h2>10. Lei Aplicável e Foro Competente</h2>
            <p>
              Estes Termos e Condições são regidos pela lei portuguesa. Qualquer
              litígio decorrente da utilização do InTrack ficará sujeito à
              competência exclusiva dos tribunais portugueses.
            </p>

            <h2>11. Alterações</h2>
            <p>
              Reservamo-nos o direito de alterar estes Termos e Condições a
              qualquer momento. As alterações serão publicadas nesta página, com
              atualização da data no topo. A continuação da utilização do
              InTrack após a publicação de alterações constitui aceitação dos
              novos termos.
            </p>

            <h2>12. Contacto</h2>
            <p>
              Para qualquer questão relacionada com estes termos, contacta-nos
              em{" "}
              <a href="mailto:contact@intrack.pt">contact@intrack.pt</a>.
            </p>
          </article>
        </main>
      </GradientBackground>
    </ThemeProvider>
  );
}
