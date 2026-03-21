import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { Button } from "@/components/ui/button";
import { formatCurrency, services } from "@/lib/mock-admin-data";

export default function ServicesPage() {
  return (
    <AdminShell active="services">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Services</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage available services and pricing details.
            </p>
          </div>
          <Link href="/services/add">
            <Button>
              <Plus />
              Add Service
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
                  Service ID
                </th>
                <th className="border-b border-border/70 px-4 py-3">Name</th>
                <th className="border-b border-border/70 px-4 py-3">Cost</th>
                <th className="border-b border-border/70 px-4 py-3">
                  Discounted Cost
                </th>
                <th className="border-b border-border/70 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service.serviceId}
                  className="text-sm hover:bg-muted/30"
                >
                  <td className="border-b border-border/60 px-4 py-3 font-medium text-foreground">
                    <Link
                      href={`/services/${service.serviceId}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {service.serviceId}
                    </Link>
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-foreground">
                    {service.name}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                    {formatCurrency(service.cost)}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                    {service.discountedCost
                      ? formatCurrency(service.discountedCost)
                      : "-"}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/services/${service.serviceId}`}>
                        <Button variant="outline" size="xs">
                          View
                        </Button>
                      </Link>
                      <Link href={`/services/${service.serviceId}`}>
                        <Button variant="outline" size="xs">
                          Edit
                        </Button>
                      </Link>
                      <Button variant="destructive" size="xs">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
