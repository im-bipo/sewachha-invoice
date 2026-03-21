"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteActionButton } from "@/components/custom/delete-action-button";
import { FormSubmitButton } from "@/components/custom/forms/form-submit-button";
import {
  createServiceAction,
  deleteServiceAction,
  updateServiceAction,
} from "@/lib/server/admin-actions";
import type { ActionResult } from "@/lib/server/admin-actions";

const initialActionResult: ActionResult = {
  success: false,
  message: "",
};

type ServiceFormProps = {
  mode: "add" | "edit";
  service?: {
    serviceId: string;
    name: string;
    cost: number;
    discountedCost: number | null;
  };
};

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();

  const action =
    mode === "edit" && service
      ? updateServiceAction.bind(null, service.serviceId)
      : createServiceAction;

  const [state, formAction] = useActionState(action, initialActionResult);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      } else {
        router.refresh();
      }
    } else {
      toast.error(state.message);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-4">
      <section className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Service details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Service ID
            </span>
            <input
              readOnly
              value={service?.serviceId ?? "Auto generated on save"}
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              name="name"
              defaultValue={service?.name ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Service name"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Cost</span>
            <input
              name="cost"
              type="number"
              min={0}
              step="0.01"
              defaultValue={service?.cost ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="0.00"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Discounted cost
            </span>
            <input
              name="discountedCost"
              type="number"
              min={0}
              step="0.01"
              defaultValue={service?.discountedCost ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="0.00"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <FormSubmitButton
          idleText={mode === "add" ? "Create Service" : "Save Service"}
          pendingText={mode === "add" ? "Creating..." : "Saving..."}
        />
        <Link href="/services">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        {mode === "edit" && service && (
          <DeleteActionButton
            confirmMessage={`Delete service ${service.serviceId}?`}
            onDelete={deleteServiceAction.bind(null, service.serviceId)}
            onSuccess={() => router.push("/services")}
          />
        )}
      </div>
    </form>
  );
}
