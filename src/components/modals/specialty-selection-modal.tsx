import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { IconStethoscope, IconNotes } from "@tabler/icons-react";
import { toasts } from "@/utils/toasts";
import { getSpecialties } from "@/lib/api/specialties";
import { updateUser } from "@/lib/api/users";
import type { Tables } from "@/schema";

// Use Supabase-generated type
type Specialty = Tables<"specialties">;

interface SpecialtySelectionModalProps {
  userId: string;
  username: string;
  onSpecialtySelected: (specialty: Specialty) => void;
}

export function SpecialtySelectionModal({
  userId,
  username,
  onSpecialtySelected,
}: SpecialtySelectionModalProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoadingSpecialties(true);
      const result = await getSpecialties();

      if (result.success) {
        setSpecialties(result.data);
      } else {
        toasts.apiError(result.error, "Erro ao carregar especialidades");
      }
      setLoadingSpecialties(false);
    };
    fetchSpecialties();
  }, []);

  const handleSubmit = async () => {
    if (!selectedSpecialty) return;

    setLoading(true);

    const result = await updateUser({
      userId,
      specialtyId: selectedSpecialty,
    });

    setLoading(false);

    if (!result.success) {
      toasts.apiError(result.error, "Erro ao selecionar especialidade");
      return;
    }

    // Find the selected specialty object to pass back
    const selectedSpecialtyObj = specialties.find(
      (s) => s.id === selectedSpecialty
    );
    if (selectedSpecialtyObj) {
      toasts.success("Especialidade selecionada com sucesso!");
      onSpecialtySelected(selectedSpecialtyObj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-border shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative pt-8 pb-6 px-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Icon */}
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-border shadow-lg">
                  <IconStethoscope className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <IconNotes className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  Bem-vindo ao InTrack, {username}!
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Para começar, seleciona a tua especialidade médica.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2"></div>
              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
                disabled={loadingSpecialties || loading}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue
                    placeholder={
                      loadingSpecialties
                        ? "A carregar especialidades..."
                        : "Seleciona a tua especialidade..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      <div className="flex items-center gap-2">
                        <IconStethoscope className="h-4 w-4 text-muted-foreground" />
                        {specialty.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedSpecialty || loading || loadingSpecialties}
              className="w-full h-11 mt-2"
              size="lg"
            >
              {loading ? "A guardar..." : "Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
