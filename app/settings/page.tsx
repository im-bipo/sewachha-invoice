import { AdminShell } from "@/components/custom/admin-shell";

export default function SettingsPage() {
  return (
    <AdminShell active="settings">
      <section className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_1px_0_rgba(16,54,29,0.03),0_10px_26px_rgba(16,54,29,0.06)] sm:p-8">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Settings page scaffold is ready for account, billing, and system
          preferences.
        </p>
      </section>
    </AdminShell>
  );
}
