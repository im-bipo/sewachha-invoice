"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type FormSubmitButtonProps = {
  idleText: string;
  pendingText: string;
};

export function FormSubmitButton({
  idleText,
  pendingText,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : idleText}
    </Button>
  );
}
