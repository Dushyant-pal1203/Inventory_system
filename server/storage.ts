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
  updateMedicine(
    id: string,
    updates: Partial<InsertMedicine>
  ): Promise<Medicine | undefined>;
  deleteMedicine(id: string): Promise<boolean>;
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
    const sampleMedicines: InsertMedicine[] = [];

    sampleMedicines.forEach((medicine) => {
      const id = randomUUID();

      const newMedicine: Medicine = {
        ...medicine,
        id,
        stockQuantity: medicine.stockQuantity ?? 0,
        description: medicine.description ?? "",
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
      description: insertMedicine.description ?? "",
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
  async deleteMedicine(id: string): Promise<boolean> {
    return this.medicines.delete(id);
  }
  async updateMedicine(
    id: string,
    updates: Partial<InsertMedicine>
  ): Promise<Medicine | undefined> {
    const existing = this.medicines.get(id);
    if (!existing) return undefined;

    const updatedMedicine: Medicine = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
    };

    this.medicines.set(id, updatedMedicine);
    return updatedMedicine;
  }
}

export const storage = new MemStorage();
