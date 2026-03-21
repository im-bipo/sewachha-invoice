import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/custom/admin-shell";
import { Button } from "@/components/ui/button";
import { customers } from "@/lib/mock-admin-data";

export default function CustomersPage() {
  return (
    <AdminShell active="customers">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Customers</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage customer records and contact details.
            </p>
          </div>
          <Link href="/customers/add">
            <Button>
              <Plus />
              Add Customer
            </Button>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white p-5 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs tracking-[0.16em] text-muted-foreground uppercase">
                <th className="border-b border-border/70 px-4 py-3">Customer ID</th>
                <th className="border-b border-border/70 px-4 py-3">Name</th>
                <th className="border-b border-border/70 px-4 py-3">Address</th>
                <th className="border-b border-border/70 px-4 py-3">Phone Number</th>
                <th className="border-b border-border/70 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId} className="text-sm hover:bg-muted/30">
                  <td className="border-b border-border/60 px-4 py-3 font-medium text-foreground">
                    <Link href={`/customers/${customer.customerId}`} className="underline-offset-4 hover:underline">
                      {customer.customerId}
                    </Link>
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-foreground">
                    {customer.name}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                    {customer.address}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3 text-muted-foreground">
                    {customer.phoneNumber}
                  </td>
                  <td className="border-b border-border/60 px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/customers/${customer.customerId}`}>
                        <Button variant="outline" size="xs">
                          View
                        </Button>
                      </Link>
                      <Link href={`/customers/${customer.customerId}`}>
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
