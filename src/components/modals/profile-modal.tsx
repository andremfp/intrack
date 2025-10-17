import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  IconMail,
  IconStethoscope,
  IconX,
  IconIdBadge,
  IconEdit,
  IconCheck,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { updateUser, deleteUserAccount } from "@/lib/api/users";
import { USER_CONSTANTS } from "@/lib/constants";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";

interface ProfileModalProps {
  user: UserData | null;
  specialty: Specialty | null;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserData) => void;
}

export function ProfileModal({
  user,
  specialty,
  onClose,
  onUserUpdated,
}: ProfileModalProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.data.display_name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!user || !specialty) return null;

  const initials =
    user.data.display_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleSaveName = async () => {
    const trimmedName = editedName.trim();

    if (!trimmedName || trimmedName === user.data.display_name) {
      setIsEditingName(false);
      return;
    }

    if (trimmedName.length > USER_CONSTANTS.MAX_DISPLAY_NAME_LENGTH) {
      toast.error("Nome muito longo", {
        description: `O nome não pode ter mais de ${USER_CONSTANTS.MAX_DISPLAY_NAME_LENGTH} caracteres.`,
      });
      return;
    }

    setIsSaving(true);

    const result = await updateUser({
      userId: user.data.user_id,
      displayName: trimmedName,
    });

    setIsSaving(false);

    if (!result.success) {
      toast.error("Erro ao atualizar nome", {
        description: result.error.userMessage,
      });
      return;
    }

    // Update successful
    setIsEditingName(false);
    toast.success("Nome atualizado com sucesso!");

    // Notify parent to refresh user data
    const updatedUser: UserData = {
      ...user,
      data: {
        ...user.data,
        display_name: trimmedName,
      },
    };
    onUserUpdated(updatedUser);
  };

  const handleCancelEdit = () => {
    setEditedName(user.data.display_name || "");
    setIsEditingName(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    const result = await deleteUserAccount();

    setIsDeleting(false);

    if (!result.success) {
      toast.error("Erro ao eliminar conta", {
        description: result.error.userMessage,
      });
      return;
    }

    // Account deleted, redirect to login and reload to unmount dashboard
    toast.success("Conta eliminada com sucesso");
    window.location.href = "/";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md border-border shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-background/80 absolute right-4 top-4 z-10"
          onClick={onClose}
        >
          <IconX className="h-4 w-4" />
        </Button>

        <CardContent className="p-0">
          {/* Profile Header */}
          <div className="relative pt-8 pb-6 px-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-border">
                  <AvatarImage src={user.avatar} alt={user.data.display_name} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/10">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Specialty */}
              <div className="text-center space-y-2 w-full">
                {/* Editable Name */}
                {isEditingName ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveName();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          handleCancelEdit();
                        }
                      }}
                      className="max-w-[200px] text-center text-lg font-bold"
                      autoFocus
                      disabled={isSaving}
                      maxLength={USER_CONSTANTS.MAX_DISPLAY_NAME_LENGTH}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleSaveName}
                      disabled={isSaving}
                    >
                      <IconCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center group">
                    <div className="relative">
                      <h2 className="text-2xl font-bold tracking-tight">
                        {user.data.display_name || "Utilizador"}
                      </h2>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 absolute left-full top-1/2 -translate-y-1/2 ml-1"
                        onClick={() => setIsEditingName(true)}
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-3 py-1"
                >
                  <IconStethoscope className="mr-1.5 h-3.5 w-3.5" />
                  {specialty.name}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Details */}
          <div className="px-6 py-6 space-y-4">
            {/* Email */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <IconMail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Email
                </p>
                <p className="text-sm font-medium truncate">
                  {user.data.email}
                </p>
              </div>
            </div>

            {/* Specialty Code */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <IconIdBadge className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Código da Especialidade
                </p>
                <p className="text-sm font-medium font-mono">
                  {specialty.code}
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-destructive/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-sm text-destructive">
                  Zona de Perigo
                </h3>
              </div>

              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Tens a certeza que queres eliminar a tua conta? Esta ação é
                    irreversível.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Escreve{" "}
                      <span className="font-mono font-bold">eliminar</span> para
                      confirmar:
                    </label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="eliminar"
                      className="font-mono mt-1"
                      disabled={isDeleting}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="flex-1"
                      disabled={isDeleting || deleteConfirmText !== "eliminar"}
                    >
                      {isDeleting ? "A eliminar..." : "Confirmar Eliminação"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Eliminar Conta
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
