import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  FileSpreadsheet,
  BookOpen,
  FileText,
  Shield,
} from "lucide-react";
import {
  getSchemaGuideForSpecialty,
  VALIDATION_RULES_GUIDE,
  FILE_FORMAT_GUIDE,
} from "./schema-guide";
import type { SchemaFieldGuide } from "./schema-guide";
import {
  COMMON_CONSULTATION_FIELDS,
  MGF_FIELDS,
  MGF_CONSULTATION_TYPE_SECTIONS,
} from "@/constants";

interface ImportSchemaGuideProps {
  specialtyCode: string;
  className?: string;
}

export function ImportSchemaGuide({
  specialtyCode,
  className,
}: ImportSchemaGuideProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const sections = getSchemaGuideForSpecialty(specialtyCode);

  const toggleField = (fieldKey: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldKey)) {
      newExpanded.delete(fieldKey);
    } else {
      newExpanded.add(fieldKey);
    }
    setExpandedFields(newExpanded);
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝";
      case "number":
        return "🔢";
      case "select":
        return "📋";
      case "combobox":
        return "🔍";
      case "boolean":
        return "✓";
      case "text-list":
        return "📄";
      case "icpc2-codes":
        return "🏥";
      default:
        return "📝";
    }
  };

  const FieldCard = ({ field }: { field: SchemaFieldGuide }) => {
    const isExpanded = expandedFields.has(field.key);

    return (
      <Card className="mb-3">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleField(field.key)}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getFieldTypeIcon(field.type)}
                  </span>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {field.label}
                      {field.requiredWhen === "always" && (
                        <Badge variant="destructive" className="text-xs">
                          Obrigatório
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {field.description}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Data Type */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Tipo de Dados</h4>
                  <Badge variant="outline">{field.type}</Badge>
                </div>

                {/* Accepted Formats */}
                {field.acceptedFormats && field.acceptedFormats.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      Formatos Aceites
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {field.acceptedFormats.map((format, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options or Examples */}
                {(() => {
                  // Check all field sources for field definition
                  const allFields = [
                    ...COMMON_CONSULTATION_FIELDS,
                    ...MGF_FIELDS,
                  ];

                  // Also check type-specific fields
                  let fieldDefinition = allFields.find(
                    (f) => f.key === field.key
                  );

                  // If not found in regular fields, check type-specific sections
                  if (!fieldDefinition) {
                    for (const typeSections of Object.values(
                      MGF_CONSULTATION_TYPE_SECTIONS
                    )) {
                      for (const section of typeSections) {
                        const found = section.fields.find(
                          (f) => f.key === field.key
                        );
                        if (found) {
                          fieldDefinition = found;
                          break;
                        }
                      }
                      if (fieldDefinition) break;
                    }
                  }

                  // For select/combobox fields, show available options
                  if (
                    fieldDefinition?.options &&
                    (field.type === "select" || field.type === "combobox")
                  ) {
                    return (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Opções Disponíveis
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fieldDefinition.options.map((option, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {option.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // For multi-select fields, show available options
                  if (
                    fieldDefinition?.options &&
                    field.type === "multi-select"
                  ) {
                    return (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Opções Disponíveis
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fieldDefinition.options.map((option, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {option.label}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Múltiplas opções podem ser selecionadas, separadas por
                          ponto e vírgula (;)
                        </p>
                      </div>
                    );
                  }

                  // For boolean fields, show accepted formats (already shown above)
                  if (field.type === "boolean") {
                    return null; // Already shown in "Accepted Formats" section
                  }

                  // For other fields, show examples if available
                  if (field.examples && field.examples.length > 0) {
                    return (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Exemplos</h4>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <code className="text-sm">
                            {field.examples.join(", ")}
                          </code>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                {/* Validation Rules */}
                {field.validationRules && field.validationRules.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Regras de Validação
                    </h4>
                    <ul className="space-y-1">
                      {field.validationRules.map((rule, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-green-600 mt-1">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes */}
                {field.notes && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Info className="h-3 w-3 text-blue-600" />
                      Notas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {field.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Guia de Importação de Consultas
        </h2>
        <p className="text-muted-foreground">
          Este guia explica o formato de dados aceito para importar consultas.
          Use-o para preparar seus arquivos CSV ou Excel antes da importação.
        </p>
      </div>

      <div className="space-y-4">
        {/* Fields Section */}
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <CardTitle className="text-lg">
                        Campos e Formatos
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Detalhes de todos os campos aceitos e seus formatos
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-6">
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold mb-3">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {section.description}
                  </p>
                  <div className="space-y-2">
                    {section.fields.map((field) => (
                      <FieldCard key={field.key} field={field} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Validation Rules Section */}
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <div className="text-left">
                      <CardTitle className="text-lg">
                        Regras de Validação
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Regras importantes que garantem integridade dos dados
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-6">
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <CardTitle className="text-amber-800">
                      Regras Importantes de Validação
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700">
                    Estas regras garantem a integridade dos dados importados.
                    Consultas que não cumprirem estas regras não serão
                    importadas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {VALIDATION_RULES_GUIDE.locationLogic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {VALIDATION_RULES_GUIDE.locationLogic.rules.map(
                    (rule, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <h4 className="font-medium text-sm mb-2 text-blue-700">
                          {rule.condition}
                        </h4>
                        <ul className="space-y-1">
                          {rule.requirements.map((req, reqIndex) => (
                            <li
                              key={reqIndex}
                              className="text-sm flex items-center gap-2"
                            >
                              <span className="font-mono">
                                {req.split(" ")[0]}
                              </span>
                              {req.substring(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {VALIDATION_RULES_GUIDE.dataIntegrity.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {VALIDATION_RULES_GUIDE.dataIntegrity.rules.map(
                      (rule, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {rule}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* File Formats Section */}
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <CardTitle className="text-lg">
                        Formatos de Arquivo
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Formatos suportados e configurações recomendadas
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Formatos de Arquivo Suportados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Formatos Aceites</h4>
                    <div className="flex flex-wrap gap-2">
                      {FILE_FORMAT_GUIDE.supportedFormats.map(
                        (format, index) => (
                          <Badge key={index} variant="outline">
                            {format}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Codificação Recomendada
                    </h4>
                    <Badge variant="secondary">
                      {FILE_FORMAT_GUIDE.encoding}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Delimitadores</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">CSV:</span>{" "}
                        {FILE_FORMAT_GUIDE.delimiters.csv}
                      </div>
                      <div>
                        <span className="font-medium">Listas:</span>{" "}
                        {FILE_FORMAT_GUIDE.delimiters.lists}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Headers (Cabeçalhos)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                        {FILE_FORMAT_GUIDE.headers.flexible}
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                        {FILE_FORMAT_GUIDE.headers.variations}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Examples Section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="w-full">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <CardTitle className="text-lg">
                        Exemplos e Dicas
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Modelo de arquivo e dicas para preparação
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-blue-800">
                      Modelo de Ficheiro
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 mb-3">
                    Descarrega um ficheiro de exemplo com todos os campos e
                    formatos corretos.
                  </p>
                  <a
                    href="/sample-consultations-mgf.csv"
                    download="sample-consultations-mgf.csv"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Descarregar CSV de Exemplo
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Dicas para Preparação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Headers Flexíveis</p>
                      <p className="text-sm text-muted-foreground">
                        Use "Data" ou "Date", "NOC" ou "Número de Processo" - o
                        sistema reconhece variações.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Campos Vazios</p>
                      <p className="text-sm text-muted-foreground">
                        Deixe células vazias para campos opcionais. Campos
                        obrigatórios vazios serão rejeitados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        Validação Automática
                      </p>
                      <p className="text-sm text-muted-foreground">
                        O sistema valida todos os dados antes da importação e
                        mostra erros específicos por linha.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
