import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSpecialties } from "@/lib/api/specialties";
import { updateUser } from "@/lib/api/users";
import type { Tables } from "@/schema";

// Use Supabase-generated type
type Specialty = Tables<"specialties">;

interface SpecialtySelectionModalProps {
  userId: string;
  onSpecialtySelected: (specialty: Specialty) => void;
}

export function SpecialtySelectionModal({
  userId,
  onSpecialtySelected,
}: SpecialtySelectionModalProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await getSpecialties();

      if (result.success) {
        setSpecialties(result.data);
      } else {
        setError(result.error.userMessage);
      }
    };
    fetchSpecialties();
  }, []);

  const handleSubmit = async () => {
    if (!selectedSpecialty) return;

    setLoading(true);
    setError(null);

    const result = await updateUser({
      userId,
      specialtyId: selectedSpecialty,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error.userMessage);
      return;
    }

    // Find the selected specialty object to pass back
    const selectedSpecialtyObj = specialties.find(
      (s) => s.id === selectedSpecialty
    );
    if (selectedSpecialtyObj) {
      onSpecialtySelected(selectedSpecialtyObj);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Seleciona a tua especialidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="specialty" className="text-sm font-medium">
              Especialidade
            </label>
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleciona a tua especialidade..." />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedSpecialty || loading}
            className="w-full"
          >
            {loading ? "A carregar..." : "Continuar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
