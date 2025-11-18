import {
  type Medicine,
  type InsertMedicine,
  type Invoice,
  type InsertInvoice,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllMedicines(): Promise<Medicine[]>;
  getMedicine(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
}

export class MemStorage implements IStorage {
  private medicines: Map<string, Medicine>;
  private invoices: Map<string, Invoice>;

  constructor() {
    this.medicines = new Map();
    this.invoices = new Map();
    this.initializeMedicines();
  }

  private initializeMedicines() {
    const sampleMedicines: InsertMedicine[] = [
      { name: "Paracetamol 500mg", price: "25.50", stockQuantity: 100 },
      { name: "Amoxicillin 250mg", price: "85.00", stockQuantity: 50 },
      { name: "Ibuprofen 400mg", price: "35.75", stockQuantity: 75 },
      { name: "Cetirizine 10mg", price: "15.00", stockQuantity: 120 },
      { name: "Omeprazole 20mg", price: "45.50", stockQuantity: 60 },
      { name: "Metformin 500mg", price: "12.00", stockQuantity: 150 },
      { name: "Amlodipine 5mg", price: "28.00", stockQuantity: 80 },
      { name: "Azithromycin 500mg", price: "120.00", stockQuantity: 40 },
      { name: "Vitamin D3 60000 IU", price: "55.00", stockQuantity: 90 },
      { name: "Calcium Carbonate 500mg", price: "18.50", stockQuantity: 110 },
      { name: "Diclofenac Sodium 50mg", price: "22.00", stockQuantity: 70 },
      { name: "Ranitidine 150mg", price: "32.00", stockQuantity: 65 },
      { name: "Ciprofloxacin 500mg", price: "95.00", stockQuantity: 45 },
      { name: "Dolo 650mg", price: "30.00", stockQuantity: 100 },
      { name: "Montelukast 10mg", price: "48.00", stockQuantity: 55 },
      { name: "Pantoprazole 40mg", price: "52.00", stockQuantity: 60 },
      { name: "Losartan 50mg", price: "38.00", stockQuantity: 70 },
      { name: "Atorvastatin 10mg", price: "42.00", stockQuantity: 80 },
      { name: "Salbutamol Inhaler", price: "125.00", stockQuantity: 35 },
      { name: "Multivitamin Tablets", price: "65.00", stockQuantity: 95 },
    ];

    sampleMedicines.forEach((medicine) => {
      const id = randomUUID();
      const newMedicine: Medicine = {
        ...medicine,
        id,
        stockQuantity: medicine.stockQuantity ?? 0,
      };
      this.medicines.set(id, newMedicine);
    });
  }

  async getAllMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const id = randomUUID();
    const medicine: Medicine = {
      ...insertMedicine,
      id,
      stockQuantity: insertMedicine.stockQuantity ?? 0,
    };
    this.medicines.set(id, medicine);
    return medicine;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoice: Invoice = {
      id,
      billNumber: insertInvoice.billNumber,
      issueDate: insertInvoice.issueDate,
      clientName: insertInvoice.clientName,
      clientAddress: insertInvoice.clientAddress,
      clientPhone: insertInvoice.clientPhone,
      items: insertInvoice.items,
      subtotal:
        typeof insertInvoice.subtotal === "string"
          ? insertInvoice.subtotal
          : String(insertInvoice.subtotal),
      taxPercentage:
        typeof insertInvoice.taxPercentage === "string"
          ? insertInvoice.taxPercentage
          : String(insertInvoice.taxPercentage),
      taxAmount:
        typeof insertInvoice.taxAmount === "string"
          ? insertInvoice.taxAmount
          : String(insertInvoice.taxAmount),
      totalDue:
        typeof insertInvoice.totalDue === "string"
          ? insertInvoice.totalDue
          : String(insertInvoice.totalDue),
      createdAt: new Date(),
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }
}

export const storage = new MemStorage();
