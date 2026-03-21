import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerItem } from "@/lib/mock-admin-data";

type CustomerFormProps = {
  mode: "add" | "edit";
  customer?: CustomerItem;
};

export function CustomerForm({ mode, customer }: CustomerFormProps) {
  return (
    <form className="space-y-4">
      <section className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Customer details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">
              Customer ID
            </span>
            <input
              readOnly
              value={customer?.customerId ?? "Auto generated on save"}
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              defaultValue={customer?.name ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Customer name"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">Address</span>
            <input
              defaultValue={customer?.address ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Address"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">
              Phone number
            </span>
            <input
              defaultValue={customer?.phoneNumber ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              placeholder="Phone number"
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Save</Button>
        <Link href="/customers">
          <Button variant="outline">Cancel</Button>
        </Link>
        {mode === "edit" && <Button variant="destructive">Delete</Button>}
      </div>
    </form>
  );
}
