import { Link, useNavigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect } from "react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { GradientBackground } from "@/components/ui/gradient-background";
import { AppLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            <h1>Política de Privacidade</h1>
            <p className="text-muted-foreground text-sm">
              Última atualização: 2 de maio de 2026
            </p>

            <h2>1. Identificação do Responsável pelo Tratamento</h2>
            <p>
              O InTrack é responsável pelo tratamento dos teus dados pessoais,
              nos termos do Regulamento Geral de Proteção de Dados (RGPD —
              Regulamento UE 2016/679) e da Lei n.º 58/2019 (lei nacional de
              execução do RGPD em Portugal).
            </p>
            <p>
              Contacto:{" "}
              <a href="mailto:contact@intrack.pt">contact@intrack.pt</a>
            </p>

            <h2>2. Que Dados Recolhemos</h2>
            <p>Para a criação e gestão da tua conta, recolhemos:</p>
            <ul>
              <li>Endereço de email</li>
              <li>Nome de utilizador</li>
            </ul>
            <p>
              Os registos de consultas que introduzes na plataforma são dados
              profissionais anonimizados — não contêm quaisquer dados
              identificativos de doentes (sem número de SNS, nome de doente, ou
              outros dados pessoais de terceiros).
            </p>

            <h2>3. Para Que Utilizamos os Teus Dados</h2>
            <p>Os teus dados são utilizados exclusivamente para:</p>
            <ul>
              <li>Criar e gerir a tua conta</li>
              <li>
                Prestar o serviço InTrack (registo e acompanhamento de
                consultas)
              </li>
              <li>
                Comunicar contigo em caso de necessidade (por ex., recuperação
                de password)
              </li>
            </ul>
            <p>
              Não utilizamos os teus dados para fins comerciais, publicidade ou
              partilha com terceiros.
            </p>

            <h2>4. Base Jurídica do Tratamento</h2>
            <p>
              O tratamento dos teus dados baseia-se na execução do contrato
              (art. 6.º, n.º 1, al. b) do RGPD) — é necessário para prestar o
              serviço que solicitaste ao criar a conta.
            </p>

            <h2>5. Subcontratantes e Transferências de Dados</h2>
            <p>
              Os teus dados são armazenados na plataforma{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase
              </a>{" "}
              (servidor na Irlanda, União Europeia — Região eu-west-1), que atua
              como subcontratante nos termos do art. 28.º do RGPD. Todos os
              dados permanecem dentro do Espaço Económico Europeu.
            </p>
            <p>
              Não partilhamos os teus dados com outros terceiros, anunciantes ou
              serviços de análise.
            </p>

            <h2>6. Cookies e Armazenamento Local</h2>
            <p>
              O InTrack não utiliza cookies de rastreio ou publicidade.
              Utilizamos o armazenamento local do browser (<code>localStorage</code>)
              exclusivamente para:
            </p>
            <ul>
              <li>
                Manter a tua sessão ativa (token de autenticação JWT)
              </li>
              <li>
                Guardar preferências de interface (tema, filtros ativos,
                separador ativo, perfil em cache)
              </li>
            </ul>
            <p>
              Estes dados são estritamente necessários para o funcionamento da
              plataforma e não requerem o teu consentimento. Não são
              transmitidos a terceiros e são eliminados ao terminares sessão ou
              eliminares a conta.
            </p>

            <h2>7. Por Quanto Tempo Guardamos os Teus Dados</h2>
            <p>
              Os teus dados são mantidos enquanto a tua conta estiver ativa. Ao
              eliminares a tua conta (opção disponível nas definições da
              aplicação), todos os dados — conta e registos de consultas — são
              permanentemente apagados de imediato, sem qualquer período de
              retenção.
            </p>

            <h2>8. Os Teus Direitos</h2>
            <p>Tens os seguintes direitos ao abrigo do RGPD:</p>
            <ul>
              <li>
                <strong>Acesso</strong> — solicitar uma cópia dos teus dados
                pessoais
              </li>
              <li>
                <strong>Retificação</strong> — corrigir dados incorretos ou
                incompletos
              </li>
              <li>
                <strong>Apagamento</strong> — eliminar a tua conta e todos os
                dados associados (disponível diretamente na aplicação)
              </li>
              <li>
                <strong>Portabilidade</strong> — exportar os teus registos de
                consultas em formato Excel (funcionalidade disponível na
                aplicação)
              </li>
              <li>
                <strong>Limitação</strong> — solicitar a restrição do tratamento
                dos teus dados
              </li>
              <li>
                <strong>Oposição</strong> — opor-te ao tratamento dos teus dados
              </li>
            </ul>
            <p>
              Para exerceres os teus direitos, contacta-nos em{" "}
              <a href="mailto:contact@intrack.pt">contact@intrack.pt</a>.
            </p>

            <h2>9. Decisões Automatizadas</h2>
            <p>
              O InTrack não realiza qualquer tomada de decisão automatizada nem
              criação de perfis com base nos teus dados.
            </p>

            <h2>10. Direito de Reclamação</h2>
            <p>
              Tens o direito de apresentar reclamação à autoridade de controlo
              portuguesa:
            </p>
            <p>
              <strong>Comissão Nacional de Proteção de Dados (CNPD)</strong>
              <br />
              Rua de São Bento, n.º 148-3.º
              <br />
              1200-821 Lisboa
              <br />
              <a
                href="https://www.cnpd.pt"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cnpd.pt
              </a>
            </p>

            <h2>11. Alterações à Política de Privacidade</h2>
            <p>
              Quaisquer alterações a esta política serão publicadas nesta página,
              com atualização da data no topo. Recomendamos que consultes esta
              página periodicamente.
            </p>
          </article>
        </main>
      </GradientBackground>
    </ThemeProvider>
  );
}
