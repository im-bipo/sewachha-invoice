import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { ServiceForm } from "@/components/custom/forms/service-form";
import { Button } from "@/components/ui/button";
import { getCurrentDashboardRole } from "@/lib/server/admin-auth";

export default async function AddServicePage() {
  const role = await getCurrentDashboardRole();

  if (role === "staff") {
    redirect("/customers");
  }

  return (
    <AdminShell active="services">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Add Service
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Create a new service item and set default pricing.
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

      <ServiceForm mode="add" />
    </AdminShell>
  );
}
