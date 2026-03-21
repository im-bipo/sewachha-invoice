"use client";

import Image from "next/image";
import Link from "next/link";
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
      <h2 className="text-xl font-semibold text-foreground">Basic info</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Invoice ID
          </span>
          <input
            readOnly
            value={invoiceId ?? "Auto generated on save"}
            className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Invoice date
          </span>
          <input
            name="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(event) => onInvoiceDateChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Customer</span>
          <SearchableSelect
            name="customerId"
            value={customerId}
            onChange={onCustomerChange}
            options={customerOptions}
            placeholder="Select customer"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Status</span>
          <select
            name="status"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as InvoiceStatus)
            }
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
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
  onQuantityChange: (rowIndex: number, quantityValue: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: number) => void;
};

export function InvoiceItemsSection({
  rows,
  serviceOptions,
  onServiceChange,
  onQuantityChange,
  onAddRow,
  onRemoveRow,
}: InvoiceItemsSectionProps) {
  return (
    <section className={formCardClass}>
      <h2 className="text-xl font-semibold text-foreground">Invoice items</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Service auto-fills rate. Quantity defaults to 1.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-160 border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
              <th className="border-b border-border/70 px-3 py-2">Service</th>
              <th className="border-b border-border/70 px-3 py-2">Qty</th>
              <th className="border-b border-border/70 px-3 py-2">Rate</th>
              <th className="border-b border-border/70 px-3 py-2">Total</th>
              <th className="border-b border-border/70 px-3 py-2 text-right">
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
                  <td className="border-b border-border/60 px-3 py-2">
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
                  <td className="border-b border-border/60 px-3 py-2">
                    <input
                      name={`items.${index}.quantity`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        onQuantityChange(index, event.target.value)
                      }
                      className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <p className="h-9 w-28 px-2 text-sm leading-9 text-foreground">
                      {formatCurrency(item.unitPrice)}
                    </p>
                    <input
                      type="hidden"
                      name={`items.${index}.unitPrice`}
                      value={item.unitPrice}
                    />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <p className="h-9 w-32 px-2 text-sm leading-9 text-foreground">
                      {formatCurrency(lineTotal)}
                    </p>
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
                  <td className="border-b border-border/60 px-3 py-2 text-right">
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
        <Button type="button" variant="outline" onClick={onAddRow}>
          <Plus />
          Add
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
      <h2 className="text-xl font-semibold text-foreground">
        Discount and VAT
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Discount (%)
          </span>
          <input
            name="discount"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={discount}
            onChange={(event) => {
              const value = Number(event.target.value);
              const normalized = Number.isFinite(value)
                ? Math.min(100, Math.max(0, value))
                : 0;
              onDiscountChange(normalized);
            }}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">VAT (%)</span>
          <input
            name="vat"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={vat}
            onChange={(event) => {
              const value = Number(event.target.value);
              const normalized = Number.isFinite(value)
                ? Math.min(100, Math.max(0, value))
                : 0;
              onVatChange(normalized);
            }}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
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
      <h2 className="text-xl font-semibold text-foreground">Notes</h2>
      <textarea
        name="note"
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        rows={4}
        className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
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
}: InvoicePreviewCardProps) {
  const shouldShowPaymentPage = status === "PENDING" || status === "OVERDUE";

  return (
    <aside className="self-start xl:sticky xl:top-20">
      <div
        id="invoice-print-controls"
        className="mb-3 flex items-center justify-between gap-3 print:hidden"
      >
        <h3 className="text-lg font-semibold text-foreground">
          Invoice Preview
        </h3>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer />
          Print
        </Button>
      </div>

      <div className="rounded-3xl border border-border/70 bg-white/60 p-3 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] print:border-none print:bg-transparent print:p-0 print:shadow-none">
        <div id="invoice-print-document" className="mx-auto w-full">
          <article className="invoice-print-page aspect-210/297 w-full bg-white p-7 text-[11px] leading-relaxed text-zinc-800 shadow-[0_16px_40px_rgba(2,14,8,0.14)]">
            <header className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
                  Sewachha Invoice
                </p>
                <h4 className="mt-1 text-2xl font-semibold text-zinc-900">
                  Invoice
                </h4>
              </div>
              <div className="text-right text-xs">
                <p>
                  <span className="font-semibold">ID:</span>{" "}
                  {invoiceId ?? "Auto on save"}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {invoiceDate || "-"}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {statusToLabel(status)}
                </p>
              </div>
            </header>

            <section className="mt-5 grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="font-semibold tracking-wide text-zinc-600 uppercase">
                  Business Info
                </p>
                <p className="mt-1 font-medium text-zinc-900">
                  Sewachha Invoice Pvt. Ltd.
                </p>
                <p>Kathmandu, Nepal</p>
                <p>+977-01-XXXXXXX</p>
                <p>billing@sewachhainvoice.com</p>
              </div>

              <div>
                <p className="font-semibold tracking-wide text-zinc-600 uppercase">
                  Bill To
                </p>
                {selectedCustomer ? (
                  <p className="mt-1 font-medium text-zinc-900">
                    <Link
                      href={`/customers/${selectedCustomer.customerId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {selectedCustomer.name}
                    </Link>
                  </p>
                ) : (
                  <p className="mt-1 font-medium text-zinc-900">
                    Select customer
                  </p>
                )}
                <p>{selectedCustomer?.address || "Address not provided"}</p>
                <p>{selectedCustomer?.phoneNumber || "Phone not provided"}</p>
              </div>
            </section>

            <section className="mt-5">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-left uppercase">
                    <th className="px-2 py-2 font-semibold">Service</th>
                    <th className="px-2 py-2 font-semibold">Qty</th>
                    <th className="px-2 py-2 font-semibold">Unit Price</th>
                    <th className="px-2 py-2 font-semibold">Line Total</th>
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
                          className="border-b border-zinc-200"
                        >
                          <td className="px-2 py-2">
                            {service?.name ?? row.serviceId}
                          </td>
                          <td className="px-2 py-2">{row.quantity}</td>
                          <td className="px-2 py-2">
                            {formatCurrency(row.unitPrice)}
                          </td>
                          <td className="px-2 py-2">
                            {formatCurrency(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="border-b border-zinc-200 px-2 py-3 text-zinc-500"
                      >
                        No items selected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="mt-4 ml-auto w-52 text-xs">
              <div className="flex items-center justify-between py-1">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Discount</span>
                <span>
                  -{formatCurrency(totals.discount)} ({totals.discountPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>VAT</span>
                <span>
                  {formatCurrency(totals.vat)} ({totals.vatPercent}%)
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-zinc-300 pt-2 text-sm font-semibold text-zinc-900">
                <span>Grand Total</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </section>

            {note.trim() && (
              <section className="mt-5 text-xs">
                <p className="font-semibold tracking-wide text-zinc-600 uppercase">
                  Notes
                </p>
                <p className="mt-1 min-h-10 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 text-zinc-700">
                  {note.trim()}
                </p>
              </section>
            )}

            <footer className="mt-6 border-t border-zinc-200 pt-3 text-center text-[10px] text-zinc-500">
              Thank you for your business.
            </footer>
          </article>

          {shouldShowPaymentPage && (
            <article className="invoice-print-page mt-4 hidden w-full bg-white p-7 shadow-[0_16px_40px_rgba(2,14,8,0.14)] print:mt-0 print:block print:shadow-none">
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
    </aside>
  );
}
