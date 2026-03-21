export type InvoiceStatus = "Paid" | "Pending" | "Draft" | "Overdue";

export type InvoiceListItem = {
  invoiceId: string;
  customer: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
};

export type CustomerItem = {
  customerId: string;
  name: string;
  address: string;
  phoneNumber: string;
};

export type ServiceItem = {
  serviceId: string;
  name: string;
  cost: number;
  discountedCost?: number;
};

export type InvoiceFormItem = {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
  lineTotal: number;
};

export type InvoiceFormData = {
  invoiceId: string;
  customerId: string;
  invoiceDate: string;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceFormItem[];
  summary: {
    subtotal: number;
    discount: number;
    vat: number;
    total: number;
  };
};

export const invoices: InvoiceListItem[] = [
  {
    invoiceId: "IID-001",
    customer: "Annapurna Traders",
    amount: 1450,
    status: "Paid",
    date: "2026-03-21",
  },
  {
    invoiceId: "IID-002",
    customer: "Pashupati Mart",
    amount: 830,
    status: "Pending",
    date: "2026-03-21",
  },
  {
    invoiceId: "IID-003",
    customer: "Cityline Pharmacy",
    amount: 2180,
    status: "Draft",
    date: "2026-03-20",
  },
  {
    invoiceId: "IID-004",
    customer: "Everest Supplies",
    amount: 560,
    status: "Overdue",
    date: "2026-03-19",
  },
  {
    invoiceId: "IID-005",
    customer: "Miteri Foods",
    amount: 1210,
    status: "Paid",
    date: "2026-03-19",
  },
];

export const customers: CustomerItem[] = [
  {
    customerId: "CID-001",
    name: "Annapurna Traders",
    address: "New Road, Kathmandu",
    phoneNumber: "+977-9801001001",
  },
  {
    customerId: "CID-002",
    name: "Pashupati Mart",
    address: "Gaushala, Kathmandu",
    phoneNumber: "+977-9801001002",
  },
  {
    customerId: "CID-003",
    name: "Cityline Pharmacy",
    address: "Biratnagar-5",
    phoneNumber: "+977-9801001003",
  },
  {
    customerId: "CID-004",
    name: "Everest Supplies",
    address: "Pokhara Lakeside",
    phoneNumber: "+977-9801001004",
  },
];

export const services: ServiceItem[] = [
  {
    serviceId: "SID-001",
    name: "Monthly Waste Pickup",
    cost: 120,
    discountedCost: 100,
  },
  {
    serviceId: "SID-002",
    name: "Commercial Collection",
    cost: 350,
    discountedCost: 310,
  },
  {
    serviceId: "SID-003",
    name: "Recycling Management",
    cost: 220,
    discountedCost: 200,
  },
  {
    serviceId: "SID-004",
    name: "Hazard Waste Handling",
    cost: 500,
  },
];

export const invoiceFormSeed: Record<string, InvoiceFormData> = {
  "IID-001": {
    invoiceId: "IID-001",
    customerId: "CID-001",
    invoiceDate: "2026-03-21",
    status: "Paid",
    notes: "Paid via bank transfer.",
    items: [
      {
        serviceId: "SID-001",
        quantity: 4,
        unitPrice: 100,
        discount: 20,
        vat: 13,
        lineTotal: 445.4,
      },
      {
        serviceId: "SID-003",
        quantity: 5,
        unitPrice: 200,
        discount: 0,
        vat: 13,
        lineTotal: 1130,
      },
    ],
    summary: {
      subtotal: 1400,
      discount: 20,
      vat: 70,
      total: 1450,
    },
  },
  "IID-002": {
    invoiceId: "IID-002",
    customerId: "CID-002",
    invoiceDate: "2026-03-21",
    status: "Pending",
    notes: "Pending cash collection.",
    items: [
      {
        serviceId: "SID-002",
        quantity: 2,
        unitPrice: 310,
        discount: 0,
        vat: 13,
        lineTotal: 700.6,
      },
    ],
    summary: {
      subtotal: 620,
      discount: 0,
      vat: 80.6,
      total: 830,
    },
  },
};

export function getInvoiceById(invoiceId: string) {
  return invoices.find((invoice) => invoice.invoiceId === invoiceId);
}

export function getCustomerById(customerId: string) {
  return customers.find((customer) => customer.customerId === customerId);
}

export function getServiceById(serviceId: string) {
  return services.find((service) => service.serviceId === serviceId);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function invoiceStatusClass(status: InvoiceStatus) {
  if (status === "Paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "Pending") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (status === "Overdue") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}
