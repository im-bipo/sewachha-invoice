import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { ServiceForm } from "@/components/custom/forms/service-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const service = await prisma.service.findUnique({
    where: { serviceId },
    select: {
      serviceId: true,
      name: true,
      cost: true,
      discountedCost: true,
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <AdminShell active="services">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Edit Service {service.serviceId}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Update service title and pricing details.
            </p>
          </div>
          <Link href="/services">
            <Button variant="outline">
              <ArrowLeft />
              Back to services
            </Button>
          </Link>
        </div>
      </section>

      <ServiceForm
        mode="edit"
        service={{
          ...service,
          cost: Number(service.cost),
          discountedCost:
            service.discountedCost == null
              ? null
              : Number(service.discountedCost),
        }}
      />
    </AdminShell>
  );
}
