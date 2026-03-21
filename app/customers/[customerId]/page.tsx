import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { CustomerForm } from "@/components/custom/forms/customer-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const customer = await prisma.customer.findUnique({
    where: { customerId },
    include: {
      invoices: {
        orderBy: { invoiceDate: "desc" },
        select: {
          invoiceId: true,
          total: true,
          status: true,
          invoiceDate: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <AdminShell active="customers">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Edit Customer {customer.customerId}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Update customer profile and contact information.
            </p>
          </div>
          <Link href="/customers">
            <Button variant="outline">
              <ArrowLeft />
              Back to customers
            </Button>
          </Link>
        </div>
      </section>

      <CustomerForm mode="edit" customer={customer} />

      <section className="mt-6 rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Invoices for {customer.name}
        </h2>
        {customer.invoices?.length ? (
          <div className="overflow-x-auto mt-4">
            <table className="w-full min-w-160 border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  <th className="border-b border-border/70 px-4 py-3">
                    Invoice ID
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
                {customer.invoices.map((invoice) => (
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
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(invoice.total))}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3">
                      {invoice.status}
                    </td>
                    <td className="border-b border-border/60 px-4 py-3">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No invoices linked to this customer yet.
          </p>
        )}
      </section>
    </AdminShell>
  );
}
