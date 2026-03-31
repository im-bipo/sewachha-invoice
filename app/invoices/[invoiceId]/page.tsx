import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { InvoiceForm } from "@/components/custom/forms/invoice-form";
import { Button } from "@/components/ui/button";
import { getCurrentDashboardRole } from "@/lib/server/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const role = await getCurrentDashboardRole();
  const isStaff = role === "staff";

  const { invoiceId } = await params;

  const [invoice, customers, services] = await Promise.all([
    prisma.invoice.findUnique({
      where: { invoiceId },
      include: {
        customer: { select: { customerId: true } },
        items: {
          select: {
            serviceIdSnapshot: true,
            quantity: true,
            unitPrice: true,
            discount: true,
            vat: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
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

  if (!invoice) {
    notFound();
  }

  const itemDiscountTotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.discount ?? 0),
    0,
  );
  const itemVatTotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.vat ?? 0),
    0,
  );

  const globalDiscountPercent =
    Number(invoice.subtotal) > 0
      ? ((Number(invoice.discount ?? 0) - itemDiscountTotal) /
          Number(invoice.subtotal)) *
        100
      : 0;
  const globalVatPercent =
    Number(invoice.subtotal) > 0
      ? ((Number(invoice.vat ?? 0) - itemVatTotal) / Number(invoice.subtotal)) *
        100
      : 0;

  const formData = {
    invoiceId: invoice.invoiceId,
    customerId: invoice.customer.customerId,
    invoiceDate: new Date(invoice.invoiceDate).toISOString().slice(0, 10),
    status: invoice.status,
    note: invoice.note ?? "",
    discount: Number(globalDiscountPercent.toFixed(2)),
    vat: Number(globalVatPercent.toFixed(2)),
    items: invoice.items.map((item) => ({
      serviceId: item.serviceIdSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount ?? 0),
      vat: Number(item.vat ?? 0),
    })),
  };

  return (
    <AdminShell active="invoices">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {isStaff ? "Invoice" : "Edit Invoice"} {invoiceId}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {isStaff
                ? "Review invoice details and print a copy."
                : "Update invoice details, line items, and payment state."}
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
        mode="edit"
        readOnly={isStaff}
        invoice={formData}
        customers={customers}
        services={services.map((service) => ({
          ...service,
          cost: Number(service.cost),
        }))}
      />
    </AdminShell>
  );
}
