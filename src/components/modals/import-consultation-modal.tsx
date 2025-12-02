import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconX, IconUpload, IconFileSpreadsheet } from "@tabler/icons-react";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  parseCsvFile,
  parseXlsxFile,
  validateImportData,
} from "@/imports/helpers";
import {
  createConsultationsBatch,
  getUserConsultationsInDateRange,
  updateConsultation,
  type Consultation,
  type ConsultationInsert,
} from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import type { ImportPreviewData } from "@/imports/types";
import {
  makeConsultationKey,
  makeConsultationKeyFromInsert,
} from "@/components/consultations/helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ImportConsultationModalProps {
  userId: string;
  specialty: Specialty | null;
  specialtyYear: number;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ImportConsultationModal({
  userId,
  specialty,
  specialtyYear,
  onClose,
  onImportComplete,
}: ImportConsultationModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [parseError, setParseError] = useState<string | null>(null);

  type DuplicateDecision = "create" | "keep-existing" | "overwrite";
  const [duplicateDecisions, setDuplicateDecisions] = useState<
    Record<number, DuplicateDecision>
  >({});
  const [duplicateExistingIds, setDuplicateExistingIds] = useState<
    Record<number, string>
  >({});

  const handleClose = () => {
    if (isParsing || isImporting) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setParseError(null);
      setPreviewData(null);
      setSelectedRows(new Set());
      setDuplicateDecisions({});
      setDuplicateExistingIds({});
      setIsParsing(true);

      try {
        const isCsv = selectedFile.name.toLowerCase().endsWith(".csv");
        const isXlsx =
          selectedFile.name.toLowerCase().endsWith(".xlsx") ||
          selectedFile.name.toLowerCase().endsWith(".xls") ||
          selectedFile.name.toLowerCase().endsWith(".numbers");

        if (!isCsv && !isXlsx) {
          throw new Error(
            "Formato de ficheiro não suportado. Por favor, use CSV, XLSX ou Numbers."
          );
        }

        const { headers, rows } = isCsv
          ? await parseCsvFile(selectedFile)
          : await parseXlsxFile(selectedFile);

        if (rows.length === 0) {
          throw new Error("O ficheiro não contém dados.");
        }

        if (!specialty) {
          throw new Error("Especialidade não encontrada.");
        }

        const preview = validateImportData(
          rows,
          headers,
          userId,
          specialty.id,
          specialty.code,
          specialtyYear
        );

        setPreviewData(preview);

        // Auto-select valid rows
        const validRowIndices = new Set<number>();
        preview.consultations.forEach((consultation, index) => {
          if (consultation.errors.length === 0) {
            validRowIndices.add(index);
          }
        });
        setSelectedRows(validRowIndices);

        // Detect duplicates against existing consultations for this user
        const validConsultationsWithKeys = preview.consultations
          .map((consultation, index) => {
            if (consultation.errors.length > 0) return null;
            const key = makeConsultationKeyFromInsert(
              consultation.data as Partial<ConsultationInsert>
            );
            return key
              ? {
                  index,
                  key,
                  date: (consultation.data.date as string) || null,
                }
              : null;
          })
          .filter(
            (
              item
            ): item is { index: number; key: string; date: string | null } =>
              item !== null
          );

        if (validConsultationsWithKeys.length > 0) {
          const dates = validConsultationsWithKeys
            .map((item) => item.date)
            .filter((date): date is string => !!date)
            .sort();

          if (dates.length > 0) {
            const minDate = dates[0]!;
            const maxDate = dates[dates.length - 1]!;

            const existingResult = await getUserConsultationsInDateRange(
              userId,
              minDate,
              maxDate
            );

            if (!existingResult.success) {
              toast.error("Erro ao verificar duplicados", {
                description: existingResult.error.userMessage,
              });
            } else {
              const existingByKey = new Map<string, Consultation>();
              existingResult.data.forEach((consultation) => {
                const key = makeConsultationKey({
                  date: consultation.date,
                  processNumber: consultation.process_number,
                });
                existingByKey.set(key, consultation);
              });

              const nextDecisions: Record<number, DuplicateDecision> = {};
              const nextExistingIds: Record<number, string> = {};

              validConsultationsWithKeys.forEach(({ index, key }) => {
                const existing = existingByKey.get(key);
                if (existing) {
                  nextDecisions[index] = "keep-existing";
                  nextExistingIds[index] = existing.id;
                } else {
                  nextDecisions[index] = "create";
                }
              });

              setDuplicateDecisions(nextDecisions);
              setDuplicateExistingIds(nextExistingIds);
            }
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao processar ficheiro";
        setParseError(message);
        toast.error("Erro ao processar ficheiro", { description: message });
      } finally {
        setIsParsing(false);
      }
    },
    [userId, specialty, specialtyYear]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (!previewData) return;

    const allValidIndices = previewData.consultations
      .map((_, index) => index)
      .filter((index) => previewData.consultations[index].errors.length === 0);

    if (allValidIndices.length === 0) return;

    const allSelected = allValidIndices.every((index) =>
      selectedRows.has(index)
    );

    if (allSelected) {
      // Deselect all valid
      const newSelected = new Set(selectedRows);
      allValidIndices.forEach((index) => newSelected.delete(index));
      setSelectedRows(newSelected);
    } else {
      // Select all valid
      const newSelected = new Set(selectedRows);
      allValidIndices.forEach((index) => newSelected.add(index));
      setSelectedRows(newSelected);
    }
  };

  const handleImport = async () => {
    if (!previewData || !specialty || selectedRows.size === 0) return;

    setIsImporting(true);

    try {
      const toCreate: { index: number; data: ConsultationInsert }[] = [];
      const toUpdate: {
        index: number;
        id: string;
        data: ConsultationInsert;
      }[] = [];

      selectedRows.forEach((index) => {
        const consultation = previewData.consultations[index];
        if (consultation.errors.length === 0) {
          const data = consultation.data as ConsultationInsert;
          const decision = duplicateDecisions[index] || "create";

          if (decision === "keep-existing") {
            // Skip this row entirely – keep existing consultation
            return;
          }

          if (decision === "overwrite") {
            const existingId = duplicateExistingIds[index];
            if (existingId) {
              toUpdate.push({ index, id: existingId, data });
              return;
            }
          }

          // Default: create new consultation
          toCreate.push({ index, data });
        }
      });

      if (toCreate.length === 0 && toUpdate.length === 0) {
        toast.error("Nenhuma consulta para importar");
        return;
      }

      let created = 0;
      const perRowErrors: Array<{ index: number; error: string }> = [];

      if (toCreate.length > 0) {
        const createPayload = toCreate.map((item) => item.data);
        const result = await createConsultationsBatch(createPayload);

        if (!result.success) {
          toast.error("Erro ao importar consultas", {
            description: result.error.userMessage,
          });
          return;
        }

        created += result.data.created;
        perRowErrors.push(...result.data.errors);
      }

      let updated = 0;
      for (const { id, data, index } of toUpdate) {
        const result = await updateConsultation(id, data);
        if (!result.success) {
          perRowErrors.push({
            index,
            error: result.error.userMessage,
          });
        } else {
          updated += 1;
        }
      }

      const totalRequested = toCreate.length + toUpdate.length;
      const failedCount = perRowErrors.length;

      if (failedCount > 0) {
        toast.warning(
          `Importação parcial: ${
            created + updated
          } de ${totalRequested} consultas processadas`,
          {
            description: `${failedCount} consultas falharam`,
          }
        );
      } else {
        toast.success(
          `${created + updated} consulta${
            created + updated !== 1 ? "s" : ""
          } importada${created + updated !== 1 ? "s" : ""} / atualizada${
            created + updated !== 1 ? "s" : ""
          } com sucesso!`
        );
      }

      onImportComplete?.();
      handleClose();
    } catch (error) {
      toast.error("Erro ao importar consultas", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const validSelectedCount = Array.from(selectedRows).filter(
    (index) => previewData?.consultations[index].errors.length === 0
  ).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 duration-200 ${
          isClosing ? "animate-out fade-out" : "animate-in fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none sm:mx-4">
        <Card
          className={`w-full h-[95vh] sm:h-auto py-0 sm:max-w-5xl sm:max-h-[92vh] overflow-hidden flex flex-col gap-0 sm:rounded-xl rounded-b-none rounded-t-xl pointer-events-auto duration-300 shadow-2xl ${
            isClosing
              ? "animate-out slide-out-to-bottom sm:slide-out-to-bottom-0 sm:zoom-out-95"
              : "animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95"
          }`}
        >
          <CardHeader className="sticky top-0 z-20 pt-3 !pb-3 sm:pt-4 sm:!pb-4 px-4 sm:px-6 flex flex-row items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
            <CardTitle className="text-lg sm:text-xl font-semibold">
              Importar Consultas
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isParsing || isImporting}
              className="flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
            <div className="space-y-6">
              {/* File Upload Area */}
              {!previewData && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.numbers"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isParsing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          A processar ficheiro...
                        </p>
                      </div>
                    ) : (
                      <>
                        <IconUpload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm font-medium mb-2">
                          Arrasta um ficheiro CSV, XLSX ou Numbers aqui
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          ou clique para selecionar
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <IconFileSpreadsheet className="h-4 w-4" />
                          <span>CSV, XLSX, Numbers</span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Parse Error */}
              {parseError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">
                      Erro ao processar ficheiro
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseError}
                    </p>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {previewData && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Total:</span>
                      <Badge variant="outline">
                        {previewData.summary.total}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Válidas:</span>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {previewData.summary.valid}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Inválidas:</span>
                      <Badge
                        variant="outline"
                        className="bg-destructive/10 text-destructive border-destructive/20"
                      >
                        {previewData.summary.invalid}
                      </Badge>
                    </div>
                    {file && (
                      <div className="flex items-center gap-2 ml-auto">
                        <IconFileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {file.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                previewData.summary.valid > 0 &&
                                previewData.consultations
                                  .map((_, index) => index)
                                  .filter(
                                    (index) =>
                                      previewData.consultations[index].errors
                                        .length === 0
                                  )
                                  .every((index) => selectedRows.has(index))
                              }
                              onCheckedChange={toggleAllRows}
                            />
                          </TableHead>
                          <TableHead className="w-16">Linha</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>N° Processo</TableHead>
                          <TableHead>Tipologia</TableHead>
                          <TableHead>Duplicado</TableHead>
                          <TableHead className="min-w-[200px]">Erros</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.consultations.map(
                          (consultation, index) => {
                            const data = consultation.data;
                            const hasErrors = consultation.errors.length > 0;
                            const isSelected = selectedRows.has(index);
                            const decision = duplicateDecisions[index];
                            const isDuplicate =
                              decision === "keep-existing" ||
                              decision === "overwrite";

                            return (
                              <TableRow
                                key={index}
                                className={hasErrors ? "bg-destructive/5" : ""}
                              >
                                <TableCell>
                                  {!hasErrors && (
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() =>
                                        toggleRowSelection(index)
                                      }
                                    />
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {consultation.rowIndex}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {data.date || "-"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {data.process_number || "-"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {data.details &&
                                  typeof data.details === "object"
                                    ? String(
                                        (
                                          data.details as Record<
                                            string,
                                            unknown
                                          >
                                        ).type || "-"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {hasErrors ? (
                                    "-"
                                  ) : isDuplicate ? (
                                    <div className="flex flex-col gap-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-amber-300 bg-amber-50 text-amber-800"
                                      >
                                        Duplicada
                                      </Badge>
                                      <div className="flex gap-1">
                                        <Button
                                          type="button"
                                          variant={
                                            decision === "keep-existing"
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            setDuplicateDecisions((prev) => ({
                                              ...prev,
                                              [index]: "keep-existing",
                                            }))
                                          }
                                        >
                                          Manter existente
                                        </Button>
                                        <Button
                                          type="button"
                                          variant={
                                            decision === "overwrite"
                                              ? "default"
                                              : "outline"
                                          }
                                          size="sm"
                                          onClick={() =>
                                            setDuplicateDecisions((prev) => ({
                                              ...prev,
                                              [index]: "overwrite",
                                            }))
                                          }
                                        >
                                          Substituir
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                                    >
                                      Nova
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {hasErrors ? (
                                    <div className="space-y-1">
                                      {consultation.errors.map(
                                        (error, errIndex) => (
                                          <Badge
                                            key={errIndex}
                                            variant="destructive"
                                            className="text-xs mr-1"
                                          >
                                            {error.message}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-green-50 text-green-700 border-green-200"
                                    >
                                      Válida
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer Actions */}
          {previewData && (
            <div className="sticky bottom-0 z-20 px-4 sm:px-6 py-3 sm:py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between gap-4 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreviewData(null);
                  setSelectedRows(new Set());
                  setParseError(null);
                }}
                disabled={isImporting}
              >
                Selecionar outro ficheiro
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isImporting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={
                    isImporting ||
                    validSelectedCount === 0 ||
                    previewData.summary.valid === 0
                  }
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />A
                      importar...
                    </>
                  ) : (
                    `Importar ${validSelectedCount} consulta${
                      validSelectedCount !== 1 ? "s" : ""
                    }`
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
