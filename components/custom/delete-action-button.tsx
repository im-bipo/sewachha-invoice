"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DeleteActionButtonProps = {
  label?: string;
  pendingLabel?: string;
  confirmMessage?: string;
  onDelete: () => Promise<{ success: boolean; message: string }>;
  onSuccess?: () => void;
};

export function DeleteActionButton({
  label = "Delete",
  pendingLabel = "Deleting...",
  confirmMessage = "Are you sure you want to delete this item?",
  onDelete,
  onSuccess,
}: DeleteActionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="xs"
      disabled={isPending}
      onClick={() => {
        const accepted = window.confirm(confirmMessage);
        if (!accepted) {
          return;
        }

        startTransition(async () => {
          const result = await onDelete();
          if (result.success) {
            toast.success(result.message);
            if (onSuccess) {
              onSuccess();
            } else {
              router.refresh();
            }
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      {isPending ? pendingLabel : label}
    </Button>
  );
}
