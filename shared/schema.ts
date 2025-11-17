import { pgTable, text, varchar, integer, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Medicine table schema
export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
});

export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicines.$inferSelect;

// Cart item schema (used in invoice items)
export const cartItemSchema = z.object({
  medicineId: z.string(),
  medicineName: z.string(),
  quantity: z.coerce.number().min(1),
  rate: z.coerce.number(),
  amount: z.coerce.number(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Invoice table schema for persistence
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billNumber: text("bill_number").notNull().unique(),
  issueDate: text("issue_date").notNull(),
  clientName: text("client_name").notNull(),
  clientAddress: text("client_address").notNull(),
  clientPhone: text("client_phone").notNull(),
  items: json("items").$type<CartItem[]>().notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalDue: decimal("total_due", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = z.object({
  billNumber: z.string().min(1),
  issueDate: z.string().min(1),
  clientName: z.string().min(1, "Client name is required"),
  clientAddress: z.string().min(1, "Client address is required"),
  clientPhone: z.string().min(10, "Valid phone number is required"),
  items: z.array(cartItemSchema).min(1, "At least one medicine must be selected"),
  subtotal: z.string(),
  taxPercentage: z.string(),
  taxAmount: z.string(),
  totalDue: z.string(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
