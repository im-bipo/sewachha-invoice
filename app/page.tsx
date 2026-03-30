import Link from "next/link";
import {
  CircleDollarSign,
  ReceiptText,
  Settings,
  SquareStack,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  invoiceStatusClass,
  statusToLabel,
} from "@/lib/server/admin-utils";

type RecentInvoiceRow = {
  invoiceId: string;
  total: number;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  invoiceDate: Date;
  customer: { name: string };
};

const summaryCardBaseClass =
  "rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)]";

export default async function Home() {
  const [
    customerCount,
    serviceCount,
    invoiceCount,
    revenueAgg,
    recentInvoices,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.invoice.count(),
    prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
    }),
    prisma.invoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: { select: { name: true } },
      },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const typedRecentInvoices: RecentInvoiceRow[] = recentInvoices.map(
    (invoice) => ({
      invoiceId: invoice.invoiceId,
      total: Number(invoice.total),
      status: invoice.status,
      invoiceDate: invoice.invoiceDate,
      customer: invoice.customer,
    }),
  );

  return (
    <AdminShell active="overview">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage customers, services, and invoices from one easy dashboard.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={summaryCardBaseClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Total Customers
              </p>
              <p className="mt-2 text-4xl font-semibold text-foreground">
                {customerCount}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Active billing customers
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Users className="size-5" />
            </div>
          </div>
        </article>

        <article className={summaryCardBaseClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Total Services
              </p>
              <p className="mt-2 text-4xl font-semibold text-foreground">
                {serviceCount}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Configured service offerings
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
              <SquareStack className="size-5" />
            </div>
          </div>
        </article>

        <article className={summaryCardBaseClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Total Invoices
              </p>
              <p className="mt-2 text-4xl font-semibold text-foreground">
                {invoiceCount}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Issued across all periods
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <ReceiptText className="size-5" />
            </div>
          </div>
        </article>

        <article className={summaryCardBaseClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Total Revenue
              </p>
              <p className="mt-2 text-4xl font-semibold text-foreground">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Collected from paid invoices
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-50 text-fuchsia-600">
              <CircleDollarSign className="size-5" />
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Recent invoices
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest billing activity across customers.
            </p>
          </div>
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <Settings />
              Manage invoices
            </Button>
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
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
              </tr>
            </thead>
            <tbody>
              {typedRecentInvoices.map((invoice) => (
                <tr key={invoice.invoiceId} className="text-sm">
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
                </tr>
              ))}
              {!recentInvoices.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No invoices yet. Start by creating your first invoice.
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
