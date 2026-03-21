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
  DiscountVatSection,
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
  const [discount, setDiscount] = useState(invoice?.discount ?? 0);
  const [vat, setVat] = useState(invoice?.vat ?? 0);
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
    const itemDiscount = previewRows.reduce((sum, row) => sum + row.discount, 0);
    const itemVat = previewRows.reduce((sum, row) => sum + row.vat, 0);
    const globalDiscountAmount = subtotal * (discount / 100);
    const taxableAfterDiscount = subtotal - itemDiscount - globalDiscountAmount;
    const globalVatAmount = taxableAfterDiscount * (vat / 100);
    const totalDiscount = itemDiscount + globalDiscountAmount;
    const totalVat = itemVat + globalVatAmount;
    const grandTotal = subtotal - totalDiscount + totalVat;

    return {
      subtotal,
      discount: totalDiscount,
      vat: totalVat,
      grandTotal,
      discountPercent: discount,
      vatPercent: vat,
    };
  }, [previewRows, discount, vat]);

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
      <input type="hidden" name="discount" value={discount} />
      <input type="hidden" name="vat" value={vat} />
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

          <DiscountVatSection
            discount={discount}
            vat={vat}
            onDiscountChange={setDiscount}
            onVatChange={setVat}
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
            margin: 0.20in;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-print-document,
          #invoice-print-document * {
            visibility: visible !important;
          }

          #invoice-print-document {
            position: absolute;
            top: 0.20in;
            left: 0.20in;
            right: 0.20in;
            bottom: 0.20in;
            margin: 0;
            width: auto;
            max-width: none;
          }

          .invoice-print-page {
            width: 190mm !important;
            min-height: 277mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            aspect-ratio: auto !important;
            break-after: page;
            page-break-after: always;
          }

          .invoice-print-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
        }
      `}</style>
    </form>
  );
}
