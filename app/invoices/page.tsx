import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { DeleteActionButton } from "@/components/custom/delete-action-button";
import { Button } from "@/components/ui/button";
import { deleteInvoiceAction } from "@/lib/server/admin-actions";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  invoiceStatusClass,
  statusToLabel,
} from "@/lib/server/admin-utils";

export default async function InvoicesPage() {
  const invoiceRows = await prisma.invoice.findMany({
    orderBy: { invoiceDate: "desc" },
    include: { customer: { select: { name: true } } },
  });

  const invoices = invoiceRows.map((invoice) => ({
    invoiceId: invoice.invoiceId,
    total: Number(invoice.total),
    status: invoice.status,
    invoiceDate: invoice.invoiceDate,
    customer: invoice.customer,
  }));

  return (
    <AdminShell active="invoices">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Invoices</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage billing records, track payment status, and review invoice
              activity.
            </p>
          </div>
          <Link href="/invoices/add">
            <Button>
              <Plus />
              Add Invoice
            </Button>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <th className="border-b border-border/70 px-4 py-3">
                  Invoice ID
                </th>
                <th className="border-b border-border/70 px-4 py-3">
                  Customer
                </th>
                <th className="border-b border-border/70 px-4 py-3">Amount</th>
                <th className="border-b border-border/70 px-4 py-3">Status</th>
                <th className="border-b border-border/70 px-4 py-3">Date</th>
                <th className="border-b border-border/70 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.invoiceId}
                  className="text-sm hover:bg-muted/30"
                >
                  <td className="border-b border-border/60 px-4 py-3 font-medium text-foreground">
                    <Link
                      href={`/invoices/${invoice.invoiceId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {invoice.invoiceId}
                    </Link>
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                    {invoice.customer.name}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 font-medium text-foreground">
                    {formatCurrency(Number(invoice.total))}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${invoiceStatusClass(
                        invoice.status,
                      )}`}
                    >
                      {statusToLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/invoices/${invoice.invoiceId}`}>
                        <Button variant="outline" size="xs">
                          View
                        </Button>
                      </Link>
                      <Link href={`/invoices/${invoice.invoiceId}`}>
                        <Button variant="outline" size="xs">
                          Edit
                        </Button>
                      </Link>
                      <DeleteActionButton
                        confirmMessage={`Delete invoice ${invoice.invoiceId}?`}
                        onDelete={deleteInvoiceAction.bind(
                          null,
                          invoice.invoiceId,
                        )}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {!invoices.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
