export type InvoiceStatusValue =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export function toMoney(value: number) {
  return Number(value.toFixed(2));
}

export function parseMoney(value: FormDataEntryValue | null) {
  if (value == null || value.toString().trim() === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function invoiceStatusClass(status: InvoiceStatusValue) {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (status === "OVERDUE") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (status === "CANCELLED") {
    return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function statusToLabel(status: InvoiceStatusValue) {
  if (status === "PAID") return "Paid";
  if (status === "PENDING") return "Pending";
  if (status === "OVERDUE") return "Overdue";
  if (status === "CANCELLED") return "Cancelled";
  return "Draft";
}

export function labelToStatus(status: string): InvoiceStatusValue {
  if (status === "PAID") return "PAID";
  if (status === "PENDING") return "PENDING";
  if (status === "OVERDUE") return "OVERDUE";
  if (status === "CANCELLED") return "CANCELLED";
  return "DRAFT";
}
