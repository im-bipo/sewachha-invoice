import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { InvoiceForm } from "@/components/custom/forms/invoice-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function AddInvoicePage() {
  const [customers, services] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { customerId: "asc" },
      select: {
        customerId: true,
        name: true,
        address: true,
        phoneNumber: true,
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { serviceId: "asc" },
      select: { serviceId: true, name: true, cost: true },
    }),
  ]);

  return (
    <AdminShell active="invoices">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Add Invoice
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Create a new invoice record with customer, items, and totals.
            </p>
          </div>
          <Link href="/invoices">
            <Button variant="outline">
              <ArrowLeft />
              Back to invoices
            </Button>
          </Link>
        </div>
      </section>

      <InvoiceForm
        mode="add"
        customers={customers}
        services={services.map((service) => ({
          ...service,
          cost: Number(service.cost),
        }))}
      />
    </AdminShell>
  );
}
