"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteActionButton } from "@/components/custom/delete-action-button";
import { FormSubmitButton } from "@/components/custom/forms/form-submit-button";
import {
  BasicInfoSection,
  InvoiceItemsSection,
  InvoicePreviewCard,
  NotesSection,
} from "@/components/custom/forms/invoice-form-sections";
import {
  statusToLabel,
  type CustomerOption,
  type InvoiceFormRecord,
  type InvoiceStatus,
  type ItemRow,
  type SelectOption,
  type ServiceOption,
} from "@/components/custom/forms/invoice-form-shared";
import {
  createInvoiceAction,
  deleteInvoiceAction,
  updateInvoiceAction,
} from "@/lib/server/admin-actions";
import type { ActionResult } from "@/lib/server/admin-actions";

type InvoiceFormProps = {
  mode: "add" | "edit";
  invoice?: InvoiceFormRecord;
  customers: CustomerOption[];
  services: ServiceOption[];
};

function createEmptyRow(): ItemRow {
  return {
    serviceId: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    vat: 0,
  };
}

const initialActionResult: ActionResult = {
  success: false,
  message: "",
};

export function InvoiceForm({
  mode,
  invoice,
  customers,
  services,
}: InvoiceFormProps) {
  const router = useRouter();

  const action =
    mode === "edit" && invoice
      ? updateInvoiceAction.bind(null, invoice.invoiceId)
      : createInvoiceAction;

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

  const today = new Date().toISOString().slice(0, 10);

  const customerOptions = useMemo<SelectOption[]>(
    () =>
      customers.map((customer) => ({
        value: customer.customerId,
        label: `${customer.name} (${customer.customerId})`,
      })),
    [customers],
  );

  const serviceOptions = useMemo<SelectOption[]>(
    () =>
      services.map((service) => ({
        value: service.serviceId,
        label: `${service.name} (${service.serviceId})`,
      })),
    [services],
  );

  const serviceMap = useMemo(
    () => new Map(services.map((service) => [service.serviceId, service])),
    [services],
  );

  const initialRows = useMemo<ItemRow[]>(() => {
    const seeded = invoice?.items?.length
      ? invoice.items.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          vat: item.vat || 0,
        }))
      : [];

    if (!seeded.length) {
      seeded.push(createEmptyRow());
    }

    return seeded;
  }, [invoice]);

  const [customerId, setCustomerId] = useState(invoice?.customerId ?? "");
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate ?? today);
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "DRAFT");
  const [note, setNote] = useState(invoice?.note ?? "");
  const [rows, setRows] = useState<ItemRow[]>(initialRows);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.customerId === customerId),
    [customerId, customers],
  );

  const previewRows = rows.filter((row) => row.serviceId);

  const totals = useMemo(() => {
    const subtotal = previewRows.reduce(
      (sum, row) => sum + row.quantity * row.unitPrice,
      0,
    );
    const discount = previewRows.reduce((sum, row) => sum + row.discount, 0);
    const vat = previewRows.reduce((sum, row) => sum + row.vat, 0);
    const grandTotal = subtotal - discount + vat;

    return { subtotal, discount, vat, grandTotal };
  }, [previewRows]);

  function handleServiceChange(rowIndex: number, serviceId: string) {
    setRows((prev) => {
      const next = [...prev];
      const selectedRate = serviceId
        ? (serviceMap.get(serviceId)?.cost ?? 0)
        : 0;
      next[rowIndex] = {
        ...next[rowIndex],
        serviceId,
        unitPrice: selectedRate,
      };
      return next;
    });
  }

  function handleQuantityChange(rowIndex: number, quantityValue: string) {
    const parsed = Number(quantityValue);
    const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = {
        ...next[rowIndex],
        quantity,
      };
      return next;
    });
  }

  function addRow() {
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  function removeRow(rowIndex: number) {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((_, index) => index !== rowIndex);
    });
  }

  return (
    <form action={formAction}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="space-y-4 print:hidden">
          <BasicInfoSection
            invoiceId={invoice?.invoiceId}
            invoiceDate={invoiceDate}
            onInvoiceDateChange={setInvoiceDate}
            customerId={customerId}
            onCustomerChange={setCustomerId}
            customerOptions={customerOptions}
            status={status}
            onStatusChange={setStatus}
          />

          <InvoiceItemsSection
            rows={rows}
            serviceOptions={serviceOptions}
            onServiceChange={handleServiceChange}
            onQuantityChange={handleQuantityChange}
            onAddRow={addRow}
            onRemoveRow={removeRow}
          />

          <NotesSection note={note} onNoteChange={setNote} />

          <div className="flex flex-wrap items-center gap-3">
            <FormSubmitButton
              idleText={mode === "add" ? "Create Invoice" : "Save Invoice"}
              pendingText={mode === "add" ? "Creating..." : "Updating..."}
            />
            <Link href="/invoices">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            {mode === "edit" && invoice && (
              <DeleteActionButton
                confirmMessage={`Delete invoice ${invoice.invoiceId}?`}
                onDelete={deleteInvoiceAction.bind(null, invoice.invoiceId)}
                onSuccess={() => router.push("/invoices")}
              />
            )}
          </div>

          {mode === "edit" && invoice && (
            <p className="text-xs text-muted-foreground">
              Editing invoice {invoice.invoiceId} (
              {statusToLabel(invoice.status)}).
            </p>
          )}
        </div>

        <InvoicePreviewCard
          invoiceId={invoice?.invoiceId}
          invoiceDate={invoiceDate}
          status={status}
          selectedCustomer={selectedCustomer}
          previewRows={previewRows}
          serviceMap={serviceMap}
          totals={totals}
          note={note}
        />
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-print-document,
          #invoice-print-document * {
            visibility: visible !important;
          }

          #invoice-print-document {
            position: fixed;
            inset: 0;
            margin: 0 auto;
            width: 190mm;
            min-height: 277mm;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            aspect-ratio: auto !important;
          }
        }
      `}</style>
    </form>
  );
}
