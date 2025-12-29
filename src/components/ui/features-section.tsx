import { cn } from "@/utils/utils";
import {
  IconFileText,
  IconChartBar,
  IconReport,
  IconFileImport,
  IconFileExport,
  IconFilter,
  IconLock,
  IconStethoscope,
} from "@tabler/icons-react";

export function FeaturesSection() {
  const features = [
    {
      title: "Escolhe a tua especialidade",
      description:
        "Neste momento só a especialidade de Medicina Geral e Familiar está disponível. Estamos a trabalhar para adicionar mais especialidades em breve.",
      icon: <IconStethoscope />,
    },
    {
      title: "Regista consultas",
      description:
        "Regista e gere consultas da tua especialidade de forma eficiente e organizada.",
      icon: <IconFileText />,
    },
    {
      title: "Filtra os dados que te interessam",
      description: "Filtra dados por local, especialidade, data, etc.",
      icon: <IconFilter />,
    },
    {
      title: "Visualiza métricas",
      description:
        "Visualiza métricas de forma clara e intuitiva, para te ajudar a tomar decisões informadas.",
      icon: <IconChartBar />,
    },
    {
      title: "Gera relatórios",
      description: "Gera relatórios de internato de forma automática.",
      icon: <IconReport />,
    },
    {
      title: "Importa consultas",
      description: "Importa consultas de fontes externas - CSV,  Excel, etc.",
      icon: <IconFileImport />,
    },
    {
      title: "Exporta os teus dados e relatórios",
      description:
        "Exporta os teus dados e relatórios em vários formatos - CSV, Excel ou PDF.",
      icon: <IconFileExport />,
    },
    {
      title: "Autenticação Segura",
      description:
        "Os teus dados estão protegidos com autenticação segura com email/password ou Google.",
      icon: <IconLock />,
    },
  ];
  return (
    <div className="relative z-20 py-6 lg:py-20 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Funcionalidades que te vão ajudar a gerir o teu internato de forma
          eficiente
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          Regista, filtra, visualiza e gere consultas de forma eficiente e
          organizada.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
