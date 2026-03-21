"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Printer } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteActionButton } from "@/components/custom/delete-action-button";
import { FormSubmitButton } from "@/components/custom/forms/form-submit-button";
import {
  createInvoiceAction,
  deleteInvoiceAction,
  updateInvoiceAction,
} from "@/lib/server/admin-actions";
import type { ActionResult } from "@/lib/server/admin-actions";
import { formatCurrency } from "@/lib/server/admin-utils";

type InvoiceFormRecord = {
  invoiceId: string;
  customerId: string;
  invoiceDate: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  note: string;
  items: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vat: number;
  }>;
};

type CustomerOption = {
  customerId: string;
  name: string;
  address: string | null;
  phoneNumber: string | null;
};

type ServiceOption = {
  serviceId: string;
  name: string;
  cost: number;
};

type InvoiceFormProps = {
  mode: "add" | "edit";
  invoice?: InvoiceFormRecord;
  customers: CustomerOption[];
  services: ServiceOption[];
};

type SelectOption = {
  value: string;
  label: string;
};

type ItemRow = {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
};

const formCardClass =
  "rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6";

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const initialActionResult: ActionResult = {
  success: false,
  message: "",
};

function statusToLabel(status: InvoiceFormRecord["status"]) {
  if (status === "PAID") return "Paid";
  if (status === "PENDING") return "Pending";
  if (status === "OVERDUE") return "Overdue";
  if (status === "CANCELLED") return "Cancelled";
  return "Draft";
}

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
      ? invoice.items.slice(0, 3).map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          vat: item.vat || 0,
        }))
      : [];

    while (seeded.length < 3) {
      seeded.push({
        serviceId: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        vat: 0,
      });
    }

    return seeded;
  }, [invoice]);

  const [customerId, setCustomerId] = useState(invoice?.customerId ?? "");
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate ?? today);
  const [status, setStatus] = useState<InvoiceFormRecord["status"]>(
    invoice?.status ?? "DRAFT",
  );
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

  return (
    <form action={formAction}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="space-y-4 print:hidden">
          <section className={formCardClass}>
            <h2 className="text-xl font-semibold text-foreground">
              Basic info
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">
                  Invoice ID
                </span>
                <input
                  readOnly
                  value={invoice?.invoiceId ?? "Auto generated on save"}
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
                  onChange={(event) => setInvoiceDate(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">
                  Customer
                </span>
                <SearchableSelect
                  name="customerId"
                  value={customerId}
                  onChange={setCustomerId}
                  options={customerOptions}
                  placeholder="Select customer"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-foreground">
                  Status
                </span>
                <select
                  name="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as InvoiceFormRecord["status"])
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

          <section className={formCardClass}>
            <h2 className="text-xl font-semibold text-foreground">
              Invoice items
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Service auto-fills rate. Quantity defaults to 1.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-160 border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    <th className="border-b border-border/70 px-3 py-2">
                      Service
                    </th>
                    <th className="border-b border-border/70 px-3 py-2">Qty</th>
                    <th className="border-b border-border/70 px-3 py-2">
                      Rate
                    </th>
                    <th className="border-b border-border/70 px-3 py-2">
                      Total
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
                              handleServiceChange(index, serviceId)
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
                              handleQuantityChange(index, event.target.value)
                            }
                            className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-sm"
                          />
                        </td>
                        <td className="border-b border-border/60 px-3 py-2">
                          <input
                            name={`items.${index}.unitPrice`}
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unitPrice}
                            readOnly
                            className="h-9 w-28 rounded-lg border border-border bg-muted px-2 text-sm"
                          />
                        </td>
                        <td className="border-b border-border/60 px-3 py-2">
                          <input
                            readOnly
                            type="text"
                            value={formatCurrency(lineTotal)}
                            className="h-9 w-32 rounded-lg border border-border bg-background px-2 text-sm"
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className={formCardClass}>
            <h2 className="text-xl font-semibold text-foreground">Notes</h2>
            <textarea
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Add remarks for this invoice"
            />
          </section>

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

        <aside className="self-start xl:sticky xl:top-20">
          <div
            id="invoice-print-controls"
            className="mb-3 flex items-center justify-between gap-3 print:hidden"
          >
            <h3 className="text-lg font-semibold text-foreground">
              Invoice Preview
            </h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
            >
              <Printer />
              Print
            </Button>
          </div>

          <div className="rounded-3xl border border-border/70 bg-white/60 p-3 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] print:border-none print:bg-transparent print:p-0 print:shadow-none">
            <article
              id="invoice-print-document"
              className="mx-auto aspect-210/297 w-full bg-white p-7 text-[11px] leading-relaxed text-zinc-800 shadow-[0_16px_40px_rgba(2,14,8,0.14)]"
            >
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
                    {invoice?.invoiceId ?? "Auto on save"}
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
                  <p className="mt-1 font-medium text-zinc-900">
                    {selectedCustomer?.name ?? "Select customer"}
                  </p>
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
                  <span>{formatCurrency(totals.discount)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>VAT</span>
                  <span>{formatCurrency(totals.vat)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-zinc-300 pt-2 text-sm font-semibold text-zinc-900">
                  <span>Grand Total</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </section>

              <section className="mt-5 text-xs">
                <p className="font-semibold tracking-wide text-zinc-600 uppercase">
                  Notes
                </p>
                <p className="mt-1 min-h-10 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 text-zinc-700">
                  {note.trim() || "No remarks added."}
                </p>
              </section>

              <footer className="mt-6 border-t border-zinc-200 pt-3 text-center text-[10px] text-zinc-500">
                Thank you for your business.
              </footer>
            </article>
          </div>
        </aside>
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

function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  compact = false,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selected = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setQuery("");
        }}
        className={`flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left text-sm text-foreground ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <span
          className={selected ? "text-foreground" : "text-muted-foreground"}
        >
          {selected?.label || placeholder}
        </span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-white p-2 shadow-lg">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="mb-2 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
          />

          <div className="max-h-48 overflow-y-auto">
            {!filteredOptions.length && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No results found.
              </p>
            )}

            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
