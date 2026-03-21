import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { CustomerForm } from "@/components/custom/forms/customer-form";
import { Button } from "@/components/ui/button";
import { getCustomerById } from "@/lib/mock-admin-data";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const customer = getCustomerById(customerId);

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
    </AdminShell>
  );
}
