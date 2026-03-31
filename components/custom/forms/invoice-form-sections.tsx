"use client";

import Image from "next/image";
import { Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  statusOptions,
  statusToLabel,
  type CustomerOption,
  type InvoiceStatus,
  type InvoiceTotals,
  type ItemRow,
  type SelectOption,
  type ServiceOption,
} from "@/components/custom/forms/invoice-form-shared";
import { SearchableSelect } from "@/components/custom/forms/searchable-select";
import { formatCurrency } from "@/lib/server/admin-utils";

const formCardClass =
  "rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6";

type BasicInfoSectionProps = {
  invoiceId?: string;
  invoiceDate: string;
  onInvoiceDateChange: (value: string) => void;
  customerId: string;
  onCustomerChange: (value: string) => void;
  customerOptions: SelectOption[];
  status: InvoiceStatus;
  onStatusChange: (value: InvoiceStatus) => void;
};

export function BasicInfoSection({
  invoiceId,
  invoiceDate,
  onInvoiceDateChange,
  customerId,
  onCustomerChange,
  customerOptions,
  status,
  onStatusChange,
}: BasicInfoSectionProps) {
  return (
    <section className={formCardClass}>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
        Basic info
      </h2>
      <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Invoice ID
          </span>
          <input
            readOnly
            value={invoiceId ?? "Auto generated on save"}
            className="h-9 sm:h-10 w-full rounded-lg border border-border bg-muted px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Invoice date
          </span>
          <input
            name="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(event) => onInvoiceDateChange(event.target.value)}
            className="h-9 sm:h-10 w-full rounded-lg border border-border bg-background px-2 sm:px-3 text-xs sm:text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Customer
          </span>
          <SearchableSelect
            name="customerId"
            value={customerId}
            onChange={onCustomerChange}
            options={customerOptions}
            placeholder="Select customer"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Status
          </span>
          <select
            name="status"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as InvoiceStatus)
            }
            className="h-9 sm:h-10 w-full rounded-lg border border-border bg-background px-2 sm:px-3 text-xs sm:text-sm text-foreground"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

type InvoiceItemsSectionProps = {
  rows: ItemRow[];
  serviceOptions: SelectOption[];
  onServiceChange: (rowIndex: number, serviceId: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: number) => void;
};

export function InvoiceItemsSection({
  rows,
  serviceOptions,
  onServiceChange,
  onAddRow,
  onRemoveRow,
}: InvoiceItemsSectionProps) {
  return (
    <section className={formCardClass}>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
        Invoice items
      </h2>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
        Add services to your invoice.
      </p>
      <div className="mt-4 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
              <th className="border-b border-border/70 px-2 sm:px-3 py-2">
                Service
              </th>
              <th className="border-b border-border/70 px-2 sm:px-3 py-2">
                Price
              </th>
              <th className="border-b border-border/70 px-2 sm:px-3 py-2 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => {
              const lineTotal =
                item.quantity * item.unitPrice - item.discount + item.vat;

              return (
                <tr key={index}>
                  <td className="border-b border-border/60 px-2 sm:px-3 py-2">
                    <SearchableSelect
                      name={`items.${index}.serviceId`}
                      value={item.serviceId}
                      onChange={(serviceId) =>
                        onServiceChange(index, serviceId)
                      }
                      options={serviceOptions}
                      placeholder="Select service"
                      compact
                    />
                  </td>
                  <td className="border-b border-border/60 px-2 sm:px-3 py-2">
                    <p className="h-8 sm:h-9 px-2 text-xs sm:text-sm leading-8 sm:leading-9 text-foreground">
                      {formatCurrency(lineTotal)}
                    </p>
                    <input
                      type="hidden"
                      name={`items.${index}.quantity`}
                      value={item.quantity}
                    />
                    <input
                      type="hidden"
                      name={`items.${index}.unitPrice`}
                      value={item.unitPrice}
                    />
                    <input
                      type="hidden"
                      name={`items.${index}.discount`}
                      value={item.discount}
                    />
                    <input
                      type="hidden"
                      name={`items.${index}.vat`}
                      value={item.vat}
                    />
                  </td>
                  <td className="border-b border-border/60 px-2 sm:px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemoveRow(index)}
                      disabled={rows.length === 1}
                      aria-label="Remove row"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onAddRow}
          className="w-full sm:w-auto"
        >
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>
    </section>
  );
}

type DiscountVatSectionProps = {
  discount: number;
  vat: number;
  onDiscountChange: (value: number) => void;
  onVatChange: (value: number) => void;
};

export function DiscountVatSection({
  discount,
  vat,
  onDiscountChange,
  onVatChange,
}: DiscountVatSectionProps) {
  return (
    <section className={formCardClass}>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
        Discount and VAT
      </h2>
      <div className="mt-3 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Discount (%)
          </span>
          <input
            name="discount"
            type="number"
            min={0}
            max={100}
            step={1}
            value={discount}
            onChange={(event) => {
              const value = Number(event.target.value);
              const normalized = Number.isFinite(value)
                ? Math.min(100, Math.max(0, value))
                : 0;
              onDiscountChange(normalized);
            }}
            className="h-9 sm:h-10 w-full rounded-lg border border-border bg-background px-2 sm:px-3 text-xs sm:text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground">
            VAT (%)
          </span>
          <input
            name="vat"
            type="number"
            min={0}
            max={100}
            step={1}
            value={vat}
            onChange={(event) => {
              const value = Number(event.target.value);
              const normalized = Number.isFinite(value)
                ? Math.min(100, Math.max(0, value))
                : 0;
              onVatChange(normalized);
            }}
            className="h-9 sm:h-10 w-full rounded-lg border border-border bg-background px-2 sm:px-3 text-xs sm:text-sm text-foreground"
          />
        </label>
      </div>
    </section>
  );
}

type NotesSectionProps = {
  note: string;
  onNoteChange: (value: string) => void;
};

export function NotesSection({ note, onNoteChange }: NotesSectionProps) {
  return (
    <section className={formCardClass}>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
        Notes
      </h2>
      <textarea
        name="note"
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        rows={4}
        className="mt-4 w-full rounded-xl border border-border bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground"
        placeholder="Add remarks for this invoice"
      />
    </section>
  );
}

type InvoicePreviewCardProps = {
  invoiceId?: string;
  invoiceDate: string;
  status: InvoiceStatus;
  selectedCustomer?: CustomerOption;
  previewRows: ItemRow[];
  serviceMap: Map<string, ServiceOption>;
  totals: InvoiceTotals;
  note: string;
  customerName?: string;
  customerId?: string;
};

export function InvoicePreviewCard({
  invoiceId,
  invoiceDate,
  status,
  selectedCustomer,
  previewRows,
  serviceMap,
  totals,
  note,
  customerName,
  customerId,
}: InvoicePreviewCardProps) {
  const shouldShowPaymentPage = status === "PENDING" || status === "OVERDUE";

  const handlePrint = () => {
    // Set document title to use as PDF filename
    const originalTitle = document.title;
    if (customerName && customerId && invoiceId) {
      document.title = `${customerName} - ${customerId} - ${invoiceId}`;
    }

    window.print();

    // Restore original title after a short delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <>
      <div className="print:hidden">
        <Button type="button" variant="outline" onClick={handlePrint}>
          <Printer />
          Print Invoice
        </Button>
      </div>

      <div id="invoice-print-document" className="hidden print:block">
        <div id="invoice-print-page-container">
          <article className="invoice-print-page aspect-210/297 w-full bg-white p-8 text-[10px] leading-relaxed text-zinc-800 shadow-[0_16px_40px_rgba(2,14,8,0.14)]">
            <header className="flex items-start justify-between border-b-2 border-zinc-900 pb-5 mb-6">
              <div>
                <p className="text-[9px] font-bold tracking-[0.15em] text-zinc-700 uppercase">
                  Sewachha Invoice
                </p>
                <h4 className="mt-2 text-3xl font-bold text-zinc-900">
                  INVOICE
                </h4>
              </div>
              <div className="text-right text-[10px] space-y-1">
                <p>
                  <span className="font-bold text-zinc-900">Invoice ID:</span>{" "}
                  <span className="font-mono">
                    {invoiceId ?? "Auto on save"}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-zinc-900">Date:</span>{" "}
                  {invoiceDate || "-"}
                </p>
                <p>
                  <span className="font-bold text-zinc-900">Status:</span>{" "}
                  <span className="px-2 py-0.5 bg-zinc-200 rounded text-zinc-900 font-semibold">
                    {statusToLabel(status)}
                  </span>
                </p>
              </div>
            </header>

            <section className="grid grid-cols-2 gap-8 mb-6 text-[10px]">
              <div>
                <p className="font-bold tracking-wide text-zinc-900 uppercase mb-2 border-b border-zinc-400 pb-1">
                  From
                </p>
                <p className="font-bold text-zinc-900 mt-1">
                  Sewachha Invoice Pvt. Ltd.
                </p>
                <p className="text-zinc-700">Kathmandu, Nepal</p>
                <p className="text-zinc-700">+977-01-XXXXXXX</p>
                <p className="text-zinc-700">billing@sewachhainvoice.com</p>
              </div>

              <div>
                <p className="font-bold tracking-wide text-zinc-900 uppercase mb-2 border-b border-zinc-400 pb-1">
                  Bill To
                </p>
                {selectedCustomer ? (
                  <p className="font-bold text-zinc-900 mt-1">
                    {selectedCustomer.name}
                  </p>
                ) : (
                  <p className="font-bold text-zinc-900 mt-1">
                    Select customer
                  </p>
                )}
                <p className="text-zinc-700">
                  {selectedCustomer?.address || "Address not provided"}
                </p>
                <p className="text-zinc-700">
                  {selectedCustomer?.phoneNumber || "Phone not provided"}
                </p>
              </div>
            </section>

            <section className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white text-[10px]">
                    <th className="px-3 py-2 text-left font-bold">Service</th>
                    <th className="px-3 py-2 text-right font-bold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.length ? (
                    previewRows.map((row, index) => {
                      const service = serviceMap.get(row.serviceId);
                      const lineTotal =
                        row.quantity * row.unitPrice - row.discount + row.vat;

                      return (
                        <tr
                          key={`${row.serviceId}-${index}`}
                          className="border-b border-zinc-300 hover:bg-zinc-50"
                        >
                          <td className="px-3 py-2.5 text-left text-zinc-900">
                            {service?.name ?? row.serviceId}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-zinc-900">
                            {formatCurrency(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="border-b border-zinc-300 px-3 py-3 text-center text-zinc-500"
                      >
                        No items selected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="ml-auto w-60 text-[10px] space-y-1 border-t-2 border-zinc-900 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-700">Subtotal</span>
                <span className="font-semibold text-zinc-900">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              {totals.discountPercent > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700">
                    Discount ({totals.discountPercent}%)
                  </span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
              )}
              {totals.vatPercent > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700">
                    VAT ({totals.vatPercent}%)
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {formatCurrency(totals.vat)}
                  </span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-zinc-900 pt-2 text-sm">
                <span className="font-bold text-zinc-900">TOTAL</span>
                <span className="font-bold text-zinc-900 text-lg">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>
            </section>

            {note.trim() && (
              <section className="mt-6 text-[10px]">
                <p className="font-bold tracking-wide text-zinc-900 uppercase mb-2 border-b border-zinc-400 pb-1">
                  Notes
                </p>
                <p className="mt-1 min-h-8 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-2 text-zinc-700">
                  {note.trim()}
                </p>
              </section>
            )}

            <footer className="mt-6 border-t-2 border-zinc-900 pt-3 text-center text-[9px] text-zinc-600 font-medium">
              Thank you for your business.
            </footer>
          </article>

          {shouldShowPaymentPage && (
            <article className="invoice-print-page mt-4 w-full bg-white p-7 shadow-[0_16px_40px_rgba(2,14,8,0.14)]">
              <div className="relative h-full min-h-[240mm] w-full">
                <Image
                  src="/payment.png"
                  alt="Payment instructions"
                  fill
                  sizes="190mm"
                  className="object-contain"
                  priority
                />
              </div>
            </article>
          )}
        </div>
      </div>
    </>
  );
}
