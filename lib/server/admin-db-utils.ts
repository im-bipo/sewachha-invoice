import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ID_PADDING = 3;

export async function ensureCurrentDbUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerkProfile = await currentUser();
  const email = clerkProfile?.emailAddresses[0]?.emailAddress;
  const fullName = [clerkProfile?.firstName, clerkProfile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const user = await prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      name: fullName || undefined,
      email: email || undefined,
    },
    create: {
      clerkUserId: userId,
      name: fullName || undefined,
      email: email || undefined,
      role: "admin",
    },
  });

  return user;
}

export async function generatePublicId(
  model: "invoice" | "customer" | "service",
  prefix: "IID" | "CID" | "SID",
) {
  type InvoiceIdRow = { invoiceId: string };
  type CustomerIdRow = { customerId: string };
  type ServiceIdRow = { serviceId: string };

  const records: InvoiceIdRow[] | CustomerIdRow[] | ServiceIdRow[] =
    model === "invoice"
      ? await prisma.invoice.findMany({ select: { invoiceId: true } })
      : model === "customer"
        ? await prisma.customer.findMany({ select: { customerId: true } })
        : await prisma.service.findMany({ select: { serviceId: true } });

  const values = records.map((record) => {
    const publicId =
      model === "invoice"
        ? (record as InvoiceIdRow).invoiceId
        : model === "customer"
          ? (record as CustomerIdRow).customerId
          : (record as ServiceIdRow).serviceId;

    const numericPart = Number(publicId.split("-")[1]);
    return Number.isFinite(numericPart) ? numericPart : 0;
  });

  const next = (values.length ? Math.max(...values) : 0) + 1;
  return `${prefix}-${String(next).padStart(ID_PADDING, "0")}`;
}
