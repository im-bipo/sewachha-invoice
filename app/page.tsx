import {
  CircleDollarSign,
  CircleUserRound,
  FileText,
  LayoutGrid,
  Plus,
  ReceiptText,
  Settings,
  SquareStack,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const summaryCards = [
  {
    label: "Total Customers",
    value: "1,248",
    detail: "Active billing customers",
    chips: ["42 new this month", "91% retained"],
    icon: Users,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Total Services",
    value: "86",
    detail: "Configured service offerings",
    chips: ["58 active", "12 featured"],
    icon: SquareStack,
    iconClass: "bg-cyan-50 text-cyan-600",
  },
  {
    label: "Total Invoices",
    value: "3,904",
    detail: "Issued across all periods",
    chips: ["38 today", "124 this week"],
    icon: ReceiptText,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    label: "Total Revenue",
    value: "$142,860",
    detail: "Collected in current quarter",
    chips: ["+12.8% vs last quarter", "$9,420 pending"],
    icon: CircleDollarSign,
    iconClass: "bg-fuchsia-50 text-fuchsia-600",
  },
];

const recentInvoices = [
  {
    id: "INV-1042",
    customer: "Annapurna Traders",
    amount: "$1,450.00",
    status: "Paid",
    date: "21 Mar 2026",
  },
  {
    id: "INV-1041",
    customer: "Pashupati Mart",
    amount: "$830.00",
    status: "Pending",
    date: "21 Mar 2026",
  },
  {
    id: "INV-1040",
    customer: "Cityline Pharmacy",
    amount: "$2,180.00",
    status: "Draft",
    date: "20 Mar 2026",
  },
  {
    id: "INV-1039",
    customer: "Everest Supplies",
    amount: "$560.00",
    status: "Overdue",
    date: "19 Mar 2026",
  },
  {
    id: "INV-1038",
    customer: "Miteri Foods",
    amount: "$1,210.00",
    status: "Paid",
    date: "19 Mar 2026",
  },
];

function statusPill(status: string) {
  if (status === "Paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "Pending") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (status === "Overdue") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(0,166,81,0.12),transparent_44%),linear-gradient(to_bottom,#f8fcf9,#f3f7f5)] pb-10">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-foreground">
                Sewachha Invoice
              </p>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          <nav
            aria-label="Main"
            className="hidden items-center gap-2 rounded-xl border border-border/80 bg-white/90 p-1.5 md:flex"
          >
            <Link
              href="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Overview
            </Link>
            <Link
              href="/customers"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Customers
            </Link>
            <Link
              href="/services"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Services
            </Link>
            <Link
              href="/invoices"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Invoices
            </Link>
            <Link
              href="/settings"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground"
            >
              Settings
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Open profile menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm"
          >
            <CircleUserRound className="size-5" />
          </button>
        </div>
      </header>

      <div className="container space-y-6 pt-6">
        <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Manage customers, services, and invoices from one easy dashboard.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                      {card.label}
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-foreground">
                      {card.value}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {card.detail}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${card.iconClass}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
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
                  12
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-cyan-700 uppercase">
                  Paid
                </p>
                <p className="mt-2 text-3xl font-semibold text-cyan-900">48</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-semibold text-amber-900">17</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold tracking-[0.16em] text-rose-700 uppercase">
                  Overdue
                </p>
                <p className="mt-2 text-3xl font-semibold text-rose-900">6</p>
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
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Paid invoice ratio
                  </span>
                  <span className="font-semibold text-foreground">78%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-2 w-[78%] rounded-full bg-emerald-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Pending payment ratio
                  </span>
                  <span className="font-semibold text-foreground">22%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-2 w-[22%] rounded-full bg-amber-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Customer activity ratio
                  </span>
                  <span className="font-semibold text-foreground">64%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-2 w-[64%] rounded-full bg-cyan-500" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Invoices today</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  14
                </p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Paid today</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">8</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Pending today</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">4</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">2</p>
              </div>
            </div>
          </aside>
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
                  <th className="border-b border-border/70 px-4 py-3">
                    Amount
                  </th>
                  <th className="border-b border-border/70 px-4 py-3">
                    Status
                  </th>
                  <th className="border-b border-border/70 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="text-sm">
                    <td className="border-b border-border/60 px-4 py-3 font-medium text-foreground">
                      {invoice.id}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                      {invoice.customer}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 font-medium text-foreground">
                      {invoice.amount}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusPill(
                          invoice.status,
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                      {invoice.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
