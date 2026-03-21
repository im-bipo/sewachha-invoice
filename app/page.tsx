import Link from "next/link";
import {
  CircleDollarSign,
  LayoutGrid,
  Plus,
  ReceiptText,
  Settings,
  SquareStack,
  UserRound,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { OverviewCharts } from "@/components/custom/overview-charts";
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
    statusGrouped,
    recentInvoices,
    invoicesForTrend,
    activeCustomerCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.invoice.count(),
    prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.invoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: { select: { name: true } },
      },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
        },
      },
      select: {
        invoiceDate: true,
        total: true,
      },
      orderBy: { invoiceDate: "asc" },
    }),
    prisma.invoice.groupBy({
      by: ["customerDbId"],
      _count: { _all: true },
    }),
  ]);

  type StatusKey = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

  const mutableStatusCounts: Record<StatusKey, number> = {
    DRAFT: 0,
    PENDING: 0,
    PAID: 0,
    OVERDUE: 0,
    CANCELLED: 0,
  };

  for (const item of statusGrouped as Array<{
    status: StatusKey;
    _count: { status: number };
  }>) {
    mutableStatusCounts[item.status] = item._count.status;
  }

  const paidCount = mutableStatusCounts.PAID;
  const pendingCount = mutableStatusCounts.PENDING;
  const draftCount = mutableStatusCounts.DRAFT;
  const overdueCount = mutableStatusCounts.OVERDUE;

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const totalInvoices = invoiceCount || 1;

  const paidRatio = Math.round((paidCount / totalInvoices) * 100);
  const pendingRatio = Math.round((pendingCount / totalInvoices) * 100);
  const activityRatio = customerCount
    ? Math.round((activeCustomerCount.length / customerCount) * 100)
    : 0;

  const invoiceTodayCount = await prisma.invoice.count({
    where: {
      invoiceDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const paidTodayCount = await prisma.invoice.count({
    where: {
      status: "PAID",
      invoiceDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const pendingTodayCount = await prisma.invoice.count({
    where: {
      status: "PENDING",
      invoiceDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const now = new Date();
  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1,
    );
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
    const label = monthDate.toLocaleDateString(undefined, { month: "short" });
    return { key, label, value: 0 };
  });

  for (const invoice of invoicesForTrend) {
    const date = new Date(invoice.invoiceDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthBuckets.find((item) => item.key === key);
    if (bucket) {
      bucket.value += Number(invoice.total);
    }
  }

  const statusChart = [
    {
      label: "Paid",
      value: paidCount,
      colorClass: "bg-emerald-500",
    },
    {
      label: "Pending",
      value: pendingCount,
      colorClass: "bg-amber-500",
    },
    {
      label: "Draft",
      value: draftCount,
      colorClass: "bg-cyan-500",
    },
    {
      label: "Overdue",
      value: overdueCount,
      colorClass: "bg-rose-500",
    },
  ];

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

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Today at a glance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track invoice flow and trigger common tasks from a single panel.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                Draft
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-900">
                {draftCount}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-cyan-700 uppercase">
                Paid
              </p>
              <p className="mt-2 text-3xl font-semibold text-cyan-900">
                {paidCount}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
                Pending
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold tracking-[0.16em] text-rose-700 uppercase">
                Overdue
              </p>
              <p className="mt-2 text-3xl font-semibold text-rose-900">
                {overdueCount}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/invoices/add">
              <Button variant="outline" className="justify-start">
                <Plus />
                Create new invoice
              </Button>
            </Link>
            <Link href="/customers/add">
              <Button variant="outline" className="justify-start">
                <UserRound />
                Add customer
              </Button>
            </Link>
            <Link href="/services/add">
              <Button variant="outline" className="justify-start">
                <Plus />
                Add service
              </Button>
            </Link>
            <Link href="/invoices">
              <Button variant="outline" className="justify-start">
                <LayoutGrid />
                Review recent invoices
              </Button>
            </Link>
          </div>
        </article>

        <aside className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
          <h3 className="text-2xl font-semibold text-foreground">
            Live status
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Collection and payment health overview.
          </p>

          <div className="mt-4 space-y-4">
            <RatioBar
              label="Paid invoice ratio"
              value={paidRatio}
              color="bg-emerald-500"
            />
            <RatioBar
              label="Pending payment ratio"
              value={pendingRatio}
              color="bg-amber-500"
            />
            <RatioBar
              label="Customer activity ratio"
              value={activityRatio}
              color="bg-cyan-500"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Invoices today" value={invoiceTodayCount} />
            <MiniStat label="Paid today" value={paidTodayCount} />
            <MiniStat label="Pending today" value={pendingTodayCount} />
            <MiniStat label="Overdue" value={overdueCount} />
          </div>
        </aside>
      </section>

      <OverviewCharts revenuePoints={monthBuckets} statusPoints={statusChart} />

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

function RatioBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-muted">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
