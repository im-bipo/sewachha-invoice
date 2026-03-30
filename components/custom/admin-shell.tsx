import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { FileText } from "lucide-react";

type NavKey = "overview" | "customers" | "services" | "invoices";

type AdminShellProps = {
  active: NavKey;
  children: React.ReactNode;
};

const navItems: Array<{ key: NavKey; label: string; href: string }> = [
  { key: "overview", label: "Overview", href: "/" },
  { key: "customers", label: "Customers", href: "/customers" },
  { key: "services", label: "Services", href: "/services" },
  { key: "invoices", label: "Invoices", href: "/invoices" },
];

export function AdminShell({ active, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(0,166,81,0.12),transparent_44%),linear-gradient(to_bottom,#f8fcf9,#f3f7f5)] pb-10">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-foreground">
                Sewachha Invoice
              </p>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-2 rounded-xl bg-white/90 p-1.5 md:flex"
          >
            {navItems.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "h-9 w-9 rounded-full border border-border bg-white shadow-sm",
              },
            }}
          />
        </div>
      </header>

      <div className="container space-y-6 pt-6">{children}</div>
    </div>
  );
}
