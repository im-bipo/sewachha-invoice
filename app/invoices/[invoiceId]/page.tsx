import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { InvoiceForm } from "@/components/custom/forms/invoice-form";
import { Button } from "@/components/ui/button";
import {
  getInvoiceById,
  invoiceFormSeed,
  InvoiceFormData,
} from "@/lib/mock-admin-data";

function buildFallbackInvoice(invoiceId: string): InvoiceFormData {
  const listInvoice = getInvoiceById(invoiceId);

  if (!listInvoice) {
    notFound();
  }

  return {
    invoiceId: listInvoice.invoiceId,
    customerId: "",
    invoiceDate: listInvoice.date,
    status: listInvoice.status,
    notes: "",
    items: [
      {
        serviceId: "",
        quantity: 1,
        unitPrice: listInvoice.amount,
        discount: 0,
        vat: 0,
        lineTotal: listInvoice.amount,
      },
    ],
    summary: {
      subtotal: listInvoice.amount,
      discount: 0,
      vat: 0,
      total: listInvoice.amount,
    },
  };
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const formData = invoiceFormSeed[invoiceId] ?? buildFallbackInvoice(invoiceId);

  return (
    <AdminShell active="invoices">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Edit Invoice {invoiceId}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Update invoice details, line items, and payment state.
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

      <InvoiceForm mode="edit" formData={formData} />
    </AdminShell>
  );
}
