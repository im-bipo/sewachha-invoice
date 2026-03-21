import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServiceItem } from "@/lib/mock-admin-data";

type ServiceFormProps = {
  mode: "add" | "edit";
  service?: ServiceItem;
};

export function ServiceForm({ mode, service }: ServiceFormProps) {
  return (
    <form className="space-y-4">
      <section className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Service details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Service ID
            </span>
            <input
              readOnly
              value={service?.serviceId ?? "Auto generated on save"}
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              defaultValue={service?.name ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Service name"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Cost</span>
            <input
              type="number"
              min={0}
              step="0.01"
              defaultValue={service?.cost ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="0.00"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Discounted cost
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              defaultValue={service?.discountedCost ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="0.00"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Save</Button>
        <Link href="/services">
          <Button variant="outline">Cancel</Button>
        </Link>
        {mode === "edit" && <Button variant="destructive">Delete</Button>}
      </div>
    </form>
  );
}
