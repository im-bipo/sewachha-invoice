"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  ensureCurrentDbUser,
  generatePublicId,
} from "@/lib/server/admin-db-utils";
import {
  getCurrentDashboardRole,
  type DashboardRole,
} from "@/lib/server/admin-auth";
import { labelToStatus, parseMoney, toMoney } from "@/lib/server/admin-utils";

export type ActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

const customerSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().trim().min(1, "Customer name is required"),
  address: z.string().trim().optional(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[+0-9()\-\s]{7,20}$/.test(value), {
      message: "Phone number looks invalid",
    }),
});

const serviceSchema = z
  .object({
    serviceId: z.string().optional(),
    name: z.string().trim().min(1, "Service name is required"),
    cost: z.number().nonnegative("Cost must be a valid positive number"),
    discountedCost: z.number().nonnegative().optional(),
  })
  .refine(
    (value) =>
      value.discountedCost == null || value.discountedCost <= value.cost,
    {
      message: "Discounted cost cannot exceed cost",
      path: ["discountedCost"],
    },
  );

const invoiceBaseSchema = z.object({
  customerId: z.string().trim().min(1, "Customer is required"),
  invoiceDate: z.string().trim().min(1, "Invoice date is required"),
  status: z.string().trim().min(1),
  note: z.string().trim().optional(),
});

type InvoiceItemPayload = {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
};

type ServiceLookup = {
  id: string;
  serviceId: string;
  name: string;
};

function parseInvoiceItems(formData: FormData): InvoiceItemPayload[] {
  const items: InvoiceItemPayload[] = [];

  const indices = Array.from(formData.keys())
    .map((key) => key.match(/^items\.(\d+)\.serviceId$/)?.[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value))
    .sort((a, b) => a - b);

  for (const i of indices) {
    const serviceId = formData.get(`items.${i}.serviceId`)?.toString().trim();

    if (!serviceId) {
      continue;
    }

    const quantity = Number(formData.get(`items.${i}.quantity`) ?? 1);
    const unitPrice = parseMoney(formData.get(`items.${i}.unitPrice`));
    const discount = parseMoney(formData.get(`items.${i}.discount`));
    const vat = parseMoney(formData.get(`items.${i}.vat`));

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error("Unit price must be a valid number");
    }

    if (!Number.isFinite(discount) || discount < 0) {
      throw new Error("Discount must be a valid number");
    }

    if (!Number.isFinite(vat) || vat < 0) {
      throw new Error("VAT must be a valid number");
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    items.push({
      serviceId,
      quantity,
      unitPrice,
      discount,
      vat,
    });
  }

  return items;
}

function mapError(error: unknown, fallback: string): ActionResult {
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0]?.message;
    return {
      success: false,
      message: firstIssue || fallback,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || fallback,
    };
  }

  return {
    success: false,
    message: fallback,
  };
}

async function ensureAllowedRoles(
  allowedRoles: DashboardRole[],
  message: string,
) {
  const role = await getCurrentDashboardRole();

  if (!allowedRoles.includes(role)) {
    throw new Error(message);
  }
}

export async function createCustomerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAllowedRoles(
      ["admin", "staff"],
      "Only admins and staff can create customers",
    );
    await ensureCurrentDbUser();

    const parsed = customerSchema.parse({
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      phoneNumber: formData.get("phoneNumber") || undefined,
    });

    const customerId = await generatePublicId("customer", "CID");

    await prisma.customer.create({
      data: {
        customerId,
        name: parsed.name,
        address: parsed.address || null,
        phoneNumber: parsed.phoneNumber || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Customer created successfully",
      redirectTo: `/customers/${customerId}`,
    };
  } catch (error) {
    return mapError(error, "Failed to create customer");
  }
}

export async function updateCustomerAction(
  customerId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAllowedRoles(
      ["admin", "staff"],
      "Only admins and staff can edit customers",
    );
    await ensureCurrentDbUser();

    const parsed = customerSchema.parse({
      customerId,
      name: formData.get("name"),
      address: formData.get("address") || undefined,
      phoneNumber: formData.get("phoneNumber") || undefined,
    });

    await prisma.customer.update({
      where: { customerId },
      data: {
        name: parsed.name,
        address: parsed.address || null,
        phoneNumber: parsed.phoneNumber || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Customer updated successfully",
      redirectTo: `/customers/${customerId}`,
    };
  } catch (error) {
    return mapError(error, "Failed to update customer");
  }
}

export async function deleteCustomerAction(customerId: string) {
  try {
    await ensureAllowedRoles(["admin"], "Only admins can delete customers");
    await ensureCurrentDbUser();

    const linkedInvoices = await prisma.invoice.count({
      where: { customer: { customerId } },
    });

    if (linkedInvoices > 0) {
      return {
        success: false,
        message: "Cannot delete customer with linked invoices",
      };
    }

    await prisma.customer.delete({
      where: { customerId },
    });

    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Customer deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete customer",
    };
  }
}

export async function createServiceAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAllowedRoles(["admin"], "Only admins can create services");
    await ensureCurrentDbUser();

    const parsed = serviceSchema.parse({
      name: formData.get("name"),
      cost: parseMoney(formData.get("cost")),
      discountedCost:
        formData.get("discountedCost")?.toString().trim() === ""
          ? undefined
          : parseMoney(formData.get("discountedCost")),
    });

    const serviceId = await generatePublicId("service", "SID");

    await prisma.service.create({
      data: {
        serviceId,
        name: parsed.name,
        cost: toMoney(parsed.cost),
        discountedCost:
          parsed.discountedCost == null ? null : toMoney(parsed.discountedCost),
      },
    });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Service created successfully",
      redirectTo: `/services/${serviceId}`,
    };
  } catch (error) {
    return mapError(error, "Failed to create service");
  }
}

export async function updateServiceAction(
  serviceId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAllowedRoles(["admin"], "Only admins can edit services");
    await ensureCurrentDbUser();

    const parsed = serviceSchema.parse({
      serviceId,
      name: formData.get("name"),
      cost: parseMoney(formData.get("cost")),
      discountedCost:
        formData.get("discountedCost")?.toString().trim() === ""
          ? undefined
          : parseMoney(formData.get("discountedCost")),
    });

    await prisma.service.update({
      where: { serviceId },
      data: {
        name: parsed.name,
        cost: toMoney(parsed.cost),
        discountedCost:
          parsed.discountedCost == null ? null : toMoney(parsed.discountedCost),
      },
    });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${serviceId}`);
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Service updated successfully",
      redirectTo: `/services/${serviceId}`,
    };
  } catch (error) {
    return mapError(error, "Failed to update service");
  }
}

export async function deleteServiceAction(serviceId: string) {
  try {
    await ensureAllowedRoles(["admin"], "Only admins can delete services");
    await ensureCurrentDbUser();

    const linkedItems = await prisma.invoiceItem.count({
      where: { service: { serviceId } },
    });

    if (linkedItems > 0) {
      return {
        success: false,
        message: "Cannot delete service linked to invoices",
      };
    }

    await prisma.service.delete({
      where: { serviceId },
    });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Service deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete service",
    };
  }
}

export async function createInvoiceAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAllowedRoles(
      ["admin", "staff"],
      "Only admins and staff can create invoices",
    );
    const currentUser = await ensureCurrentDbUser();

    const base = invoiceBaseSchema.parse({
      customerId: formData.get("customerId"),
      invoiceDate: formData.get("invoiceDate"),
      status: formData.get("status"),
      note: formData.get("note") || undefined,
    });

    const invoiceDate = new Date(base.invoiceDate);
    if (Number.isNaN(invoiceDate.getTime())) {
      return {
        success: false,
        message: "Invoice date is invalid",
      };
    }

    const discountPercent = Number(formData.get("discount") ?? 0);
    const vatPercent = Number(formData.get("vat") ?? 0);

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      throw new Error("Discount must be a percentage between 0 and 100");
    }

    if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
      throw new Error("VAT must be a percentage between 0 and 100");
    }

    const itemsInput = parseInvoiceItems(formData);
    if (!itemsInput.length) {
      return {
        success: false,
        message: "At least one invoice item is required",
      };
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId: base.customerId },
    });

    if (!customer) {
      return {
        success: false,
        message: "Selected customer was not found",
      };
    }

    const serviceRows = (await prisma.service.findMany({
      where: {
        serviceId: { in: itemsInput.map((item) => item.serviceId) },
      },
      select: {
        id: true,
        serviceId: true,
        name: true,
      },
    })) as ServiceLookup[];

    const servicesMap = new Map<string, ServiceLookup>(
      serviceRows.map((service: ServiceLookup) => [service.serviceId, service]),
    );

    const invoiceItems = itemsInput.map((item) => {
      const service = servicesMap.get(item.serviceId);
      if (!service) {
        throw new Error(`Service ${item.serviceId} not found`);
      }

      const lineSubtotal = toMoney(item.unitPrice * item.quantity);
      const lineTotal = toMoney(lineSubtotal - item.discount + item.vat);

      return {
        serviceDbId: service.id,
        serviceIdSnapshot: service.serviceId,
        serviceName: service.name,
        quantity: item.quantity,
        unitPrice: toMoney(item.unitPrice),
        discount: toMoney(item.discount),
        vat: toMoney(item.vat),
        total: lineTotal,
      };
    });

    const subtotal = toMoney(
      invoiceItems.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      ),
    );
    const itemDiscount = invoiceItems.reduce(
      (sum, item) => sum + Number(item.discount || 0),
      0,
    );
    const itemVat = invoiceItems.reduce(
      (sum, item) => sum + Number(item.vat || 0),
      0,
    );
    const globalDiscount = toMoney((Number(subtotal) * discountPercent) / 100);
    const discountedSubtotal =
      Number(subtotal) - itemDiscount - Number(globalDiscount);
    const globalVat = toMoney((discountedSubtotal * vatPercent) / 100);
    const discount = toMoney(itemDiscount + Number(globalDiscount));
    const vat = toMoney(itemVat + Number(globalVat));
    const total = toMoney(subtotal - discount + vat);

    const invoiceId = await generatePublicId("invoice", "IID");

    await prisma.invoice.create({
      data: {
        invoiceId,
        customerDbId: customer.id,
        discount,
        vat,
        subtotal,
        total,
        status: labelToStatus(base.status),
        note: base.note || null,
        invoiceDate,
        createdById: currentUser.id,
        items: {
          create: invoiceItems,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Invoice created successfully",
      redirectTo: `/invoices/${invoiceId}`,
    };
  } catch (error) {
    return mapError(error, "Failed to create invoice");
  }
}

export async function updateInvoiceAction(
  invoiceId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await ensureAllowedRoles(
      ["admin", "staff"],
      "Only admins and staff can edit invoices",
    );
    const currentUser = await ensureCurrentDbUser();

    const base = invoiceBaseSchema.parse({
      customerId: formData.get("customerId"),
      invoiceDate: formData.get("invoiceDate"),
      status: formData.get("status"),
      note: formData.get("note") || undefined,
    });

    const invoiceDate = new Date(base.invoiceDate);
    if (Number.isNaN(invoiceDate.getTime())) {
      return {
        success: false,
        message: "Invoice date is invalid",
      };
    }

    const discountPercent = Number(formData.get("discount") ?? 0);
    const vatPercent = Number(formData.get("vat") ?? 0);

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      throw new Error("Discount must be a percentage between 0 and 100");
    }

    if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
      throw new Error("VAT must be a percentage between 0 and 100");
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceId },
      select: { id: true },
    });

    if (!existingInvoice) {
      return {
        success: false,
        message: "Invoice not found",
      };
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId: base.customerId },
    });

    if (!customer) {
      return {
        success: false,
        message: "Selected customer was not found",
      };
    }

    const itemsInput = parseInvoiceItems(formData);
    if (!itemsInput.length) {
      return {
        success: false,
        message: "At least one invoice item is required",
      };
    }

    const serviceRows = (await prisma.service.findMany({
      where: {
        serviceId: { in: itemsInput.map((item) => item.serviceId) },
      },
      select: {
        id: true,
        serviceId: true,
        name: true,
      },
    })) as ServiceLookup[];

    const servicesMap = new Map<string, ServiceLookup>(
      serviceRows.map((service: ServiceLookup) => [service.serviceId, service]),
    );

    const invoiceItems = itemsInput.map((item) => {
      const service = servicesMap.get(item.serviceId);
      if (!service) {
        throw new Error(`Service ${item.serviceId} not found`);
      }

      const lineSubtotal = toMoney(item.unitPrice * item.quantity);
      const lineTotal = toMoney(lineSubtotal - item.discount + item.vat);

      return {
        serviceDbId: service.id,
        serviceIdSnapshot: service.serviceId,
        serviceName: service.name,
        quantity: item.quantity,
        unitPrice: toMoney(item.unitPrice),
        discount: toMoney(item.discount),
        vat: toMoney(item.vat),
        total: lineTotal,
      };
    });

    const subtotal = toMoney(
      invoiceItems.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
      ),
    );
    const itemDiscount = invoiceItems.reduce(
      (sum, item) => sum + Number(item.discount || 0),
      0,
    );
    const itemVat = invoiceItems.reduce(
      (sum, item) => sum + Number(item.vat || 0),
      0,
    );
    const globalDiscount = toMoney((Number(subtotal) * discountPercent) / 100);
    const discountedSubtotal =
      Number(subtotal) - itemDiscount - Number(globalDiscount);
    const globalVat = toMoney((discountedSubtotal * vatPercent) / 100);
    const discount = toMoney(itemDiscount + Number(globalDiscount));
    const vat = toMoney(itemVat + Number(globalVat));
    const total = toMoney(subtotal - discount + vat);

    await prisma.invoice.update({
      where: { invoiceId },
      data: {
        customerDbId: customer.id,
        discount,
        vat,
        subtotal,
        total,
        status: labelToStatus(base.status),
        note: base.note || null,
        invoiceDate,
        createdById: currentUser.id,
        items: {
          deleteMany: {},
          create: invoiceItems,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);

    return {
      success: true,
      message: "Invoice updated successfully",
      redirectTo: `/invoices/${invoiceId}`,
    };
  } catch (error) {
    return mapError(error, "Failed to update invoice");
  }
}

export async function deleteInvoiceAction(invoiceId: string) {
  try {
    await ensureAllowedRoles(["admin"], "Only admins can delete invoices");
    await ensureCurrentDbUser();

    await prisma.invoice.delete({
      where: { invoiceId },
    });

    revalidatePath("/");
    revalidatePath("/invoices");

    return {
      success: true,
      message: "Invoice deleted successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete invoice",
    };
  }
}
