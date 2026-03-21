import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  customers,
  formatCurrency,
  InvoiceFormData,
  services,
} from "@/lib/mock-admin-data";

type InvoiceFormProps = {
  mode: "add" | "edit";
  formData?: InvoiceFormData;
};

const formCardClass =
  "rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6";

export function InvoiceForm({ mode, formData }: InvoiceFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const items = formData?.items ?? [
    {
      serviceId: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      vat: 0,
      lineTotal: 0,
    },
  ];

  const summary =
    formData?.summary ??
    ({
      subtotal: 0,
      discount: 0,
      vat: 0,
      total: 0,
    } as const);

  return (
    <form className="space-y-4">
      <section className={formCardClass}>
        <h2 className="text-xl font-semibold text-foreground">Basic info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Invoice ID
            </span>
            <input
              readOnly
              value={formData?.invoiceId ?? "Auto generated on save"}
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Customer
            </span>
            <select
              defaultValue={formData?.customerId ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.customerId} - {customer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Invoice date
            </span>
            <input
              type="date"
              defaultValue={formData?.invoiceDate ?? today}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Status</span>
            <select
              defaultValue={formData?.status ?? "Draft"}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </label>
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="text-xl font-semibold text-foreground">Invoice items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-160 border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <th className="border-b border-border/70 px-3 py-2">Service</th>
                <th className="border-b border-border/70 px-3 py-2">Qty</th>
                <th className="border-b border-border/70 px-3 py-2">
                  Unit price
                </th>
                <th className="border-b border-border/70 px-3 py-2">
                  Discount
                </th>
                <th className="border-b border-border/70 px-3 py-2">VAT</th>
                <th className="border-b border-border/70 px-3 py-2">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.serviceId}-${index}`}>
                  <td className="border-b border-border/60 px-3 py-2">
                    <select
                      defaultValue={item.serviceId}
                      className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
                    >
                      <option value="">Select service</option>
                      {services.map((service) => (
                        <option
                          key={service.serviceId}
                          value={service.serviceId}
                        >
                          {service.serviceId} - {service.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      defaultValue={item.quantity}
                      className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={item.unitPrice}
                      className="h-9 w-28 rounded-lg border border-border bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={item.discount}
                      className="h-9 w-28 rounded-lg border border-border bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={item.vat}
                      className="h-9 w-24 rounded-lg border border-border bg-background px-2 text-sm"
                    />
                  </td>
                  <td className="border-b border-border/60 px-3 py-2 text-sm font-medium text-foreground">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="text-xl font-semibold text-foreground">Summary</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryField label="Subtotal" value={summary.subtotal} />
          <SummaryField label="Discount" value={summary.discount} />
          <SummaryField label="VAT" value={summary.vat} />
          <SummaryField label="Total" value={summary.total} emphasized />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="text-xl font-semibold text-foreground">Notes</h2>
        <textarea
          defaultValue={formData?.notes ?? ""}
          rows={4}
          className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder="Add remarks for this invoice"
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Save</Button>
        <Link href="/invoices">
          <Button variant="outline">Cancel</Button>
        </Link>
        {mode === "edit" && <Button variant="destructive">Delete</Button>}
      </div>
    </form>
  );
}

function SummaryField({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          emphasized ? "text-primary" : "text-foreground"
        }`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
