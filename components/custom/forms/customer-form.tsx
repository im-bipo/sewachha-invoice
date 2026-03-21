"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteActionButton } from "@/components/custom/delete-action-button";
import { FormSubmitButton } from "@/components/custom/forms/form-submit-button";
import {
  createCustomerAction,
  deleteCustomerAction,
  updateCustomerAction,
} from "@/lib/server/admin-actions";
import type { ActionResult } from "@/lib/server/admin-actions";

const initialActionResult: ActionResult = {
  success: false,
  message: "",
};

type CustomerFormProps = {
  mode: "add" | "edit";
  customer?: {
    customerId: string;
    name: string;
    address: string | null;
    phoneNumber: string | null;
  };
};

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  const router = useRouter();

  const action =
    mode === "edit" && customer
      ? updateCustomerAction.bind(null, customer.customerId)
      : createCustomerAction;

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
          Customer details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Customer ID
            </span>
            <input
              readOnly
              value={customer?.customerId ?? "Auto generated on save"}
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              name="name"
              defaultValue={customer?.name ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Customer name"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">Address</span>
            <input
              name="address"
              defaultValue={customer?.address ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Address"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">
              Phone number
            </span>
            <input
              name="phoneNumber"
              defaultValue={customer?.phoneNumber ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Phone number"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <FormSubmitButton
          idleText={mode === "add" ? "Create Customer" : "Save Customer"}
          pendingText={mode === "add" ? "Creating..." : "Saving..."}
        />
        <Link href="/customers">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        {mode === "edit" && customer && (
          <DeleteActionButton
            confirmMessage={`Delete customer ${customer.customerId}?`}
            onDelete={deleteCustomerAction.bind(null, customer.customerId)}
            onSuccess={() => router.push("/customers")}
          />
        )}
      </div>
    </form>
  );
}
