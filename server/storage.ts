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
  updateMedicineStock(
    id: string,
    quantityChange: number
  ): Promise<Medicine | undefined>;
  validateStockAvailability(
    medicineId: string,
    requestedQuantity: number
  ): Promise<boolean>;
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
      // You can add sample medicines here if needed
      // {
      //   name: "Sample Medicine",
      //   description: "Sample Description",
      //   price: "100.00",
      //   stockQuantity: 50
      // }
    ];

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
    console.log(
      `Medicine created: ${medicine.name} with stock: ${medicine.stockQuantity}`
    );
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
    console.log(
      `Invoice created: ${invoice.billNumber} with ${invoice.items.length} items`
    );
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
    const medicine = this.medicines.get(id);
    if (medicine) {
      console.log(`Medicine deleted: ${medicine.name}`);
    }
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
    console.log(
      `Medicine updated: ${updatedMedicine.name}, stock: ${updatedMedicine.stockQuantity}`
    );
    return updatedMedicine;
  }

  // Validate stock availability
  async validateStockAvailability(
    medicineId: string,
    requestedQuantity: number
  ): Promise<boolean> {
    const medicine = await this.getMedicine(medicineId);
    if (!medicine) {
      console.log(`Medicine not found: ${medicineId}`);
      return false;
    }

    const isValid = medicine.stockQuantity >= requestedQuantity;
    console.log(
      `Stock validation for ${medicine.name}: Available=${medicine.stockQuantity}, Requested=${requestedQuantity}, Valid=${isValid}`
    );

    return isValid;
  }

  // Update medicine stock
  async updateMedicineStock(
    id: string,
    quantityChange: number
  ): Promise<Medicine | undefined> {
    const existing = this.medicines.get(id);
    if (!existing) {
      console.log(`Medicine not found for stock update: ${id}`);
      return undefined;
    }

    console.log(
      `Updating stock for ${existing.name}: ${
        existing.stockQuantity
      } + (${quantityChange}) = ${existing.stockQuantity + quantityChange}`
    );

    const newStockQuantity = existing.stockQuantity + quantityChange;
    if (newStockQuantity < 0) {
      console.log(
        `Insufficient stock for ${existing.name}: Current=${existing.stockQuantity}, Change=${quantityChange}`
      );
      throw new Error("Insufficient stock");
    }

    const updatedMedicine: Medicine = {
      ...existing,
      stockQuantity: newStockQuantity,
    };

    this.medicines.set(id, updatedMedicine);

    // Verify the update
    const verified = this.medicines.get(id);
    console.log(
      `Stock update verified: ${verified?.name} = ${verified?.stockQuantity}`
    );

    return updatedMedicine;
  }

  // Helper method to get current state for debugging
  async getStorageState(): Promise<{
    medicines: Medicine[];
    invoices: Invoice[];
  }> {
    return {
      medicines: await this.getAllMedicines(),
      invoices: await this.getAllInvoices(),
    };
  }
}

export const storage = new MemStorage();
