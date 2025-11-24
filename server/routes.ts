import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, insertMedicineSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Medicine routes
  app.get("/api/medicines", async (req, res) => {
    try {
      const medicines = await storage.getAllMedicines();
      res.json(medicines);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      res.status(500).json({ error: "Failed to fetch medicines" });
    }
  });

  app.get("/api/medicines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const medicine = await storage.getMedicine(id);

      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }

      res.json(medicine);
    } catch (error) {
      console.error("Error fetching medicine:", error);
      res.status(500).json({ error: "Failed to fetch medicine" });
    }
  });

  // Create new medicine
  app.post("/api/medicines", async (req, res) => {
    try {
      const validatedData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validatedData);
      res.status(201).json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }
      console.error("Error creating medicine:", error);
      res.status(500).json({ error: "Failed to create medicine" });
    }
  });

  // Delete medicine
  app.delete("/api/medicines/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteMedicine(id);

      if (!success) {
        return res.status(404).json({ error: "Medicine not found" });
      }

      res.status(200).json({ message: "Medicine deleted successfully" });
    } catch (error) {
      console.error("Error deleting medicine:", error);
      res.status(500).json({ error: "Failed to delete medicine" });
    }
  });

  // Update medicine
  app.put("/api/medicines/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Create a partial schema for updates (all fields optional)
      const updateSchema = insertMedicineSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedMedicine = await storage.updateMedicine(id, validatedData);

      if (!updatedMedicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }

      res.json(updatedMedicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }
      console.error("Error updating medicine:", error);
      res.status(500).json({ error: "Failed to update medicine" });
    }
  });

  // Update medicine stock
  app.patch("/api/medicines/:id/stock", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantityChange } = req.body;

      if (typeof quantityChange !== "number") {
        return res
          .status(400)
          .json({ error: "quantityChange must be a number" });
      }

      const updatedMedicine = await storage.updateMedicineStock(
        id,
        quantityChange
      );

      if (!updatedMedicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }

      res.json(updatedMedicine);
    } catch (error) {
      if (error instanceof Error && error.message === "Insufficient stock") {
        return res.status(400).json({ error: "Insufficient stock" });
      }
      console.error("Error updating stock:", error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  // Validate stock before creating invoice
  app.post("/api/validate-stock", async (req, res) => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
      }

      const stockValidation = [];

      for (const item of items) {
        const isValid = await storage.validateStockAvailability(
          item.medicineId,
          item.quantity
        );

        const medicine = await storage.getMedicine(item.medicineId);

        stockValidation.push({
          medicineId: item.medicineId,
          medicineName: medicine?.name || "Unknown",
          requestedQuantity: item.quantity,
          availableStock: medicine?.stockQuantity || 0,
          isValid,
        });
      }

      const allValid = stockValidation.every((item) => item.isValid);

      res.json({
        valid: allValid,
        details: stockValidation,
      });
    } catch (error) {
      console.error("Error validating stock:", error);
      res.status(500).json({ error: "Failed to validate stock" });
    }
  });

  // SINGLE CORRECTED INVOICE CREATION ROUTE (with stock deduction)
  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);

      console.log("Creating invoice with items:", validatedData.items);

      // Validate stock before creating invoice
      const stockValidation = await Promise.all(
        validatedData.items.map(async (item) => {
          const medicine = await storage.getMedicine(item.medicineId);
          console.log(
            `Checking stock for ${medicine?.name}: Current stock = ${medicine?.stockQuantity}, Requested = ${item.quantity}`
          );

          const isValid = await storage.validateStockAvailability(
            item.medicineId,
            item.quantity
          );
          return { item, isValid, medicine };
        })
      );

      const insufficientStockItems = stockValidation.filter(
        (item) => !item.isValid
      );

      if (insufficientStockItems.length > 0) {
        console.log("Insufficient stock items:", insufficientStockItems);
        return res.status(400).json({
          error: "Insufficient stock",
          details: insufficientStockItems.map((item) => ({
            medicineId: item.item.medicineId,
            medicineName: item.medicine?.name,
            requestedQuantity: item.item.quantity,
            availableStock: item.medicine?.stockQuantity,
          })),
        });
      }

      // Deduct stock for each item
      console.log("Deducting stock for items:");
      for (const item of validatedData.items) {
        const medicineBefore = await storage.getMedicine(item.medicineId);
        console.log(
          `Before deduction - ${medicineBefore?.name}: ${medicineBefore?.stockQuantity}`
        );

        await storage.updateMedicineStock(item.medicineId, -item.quantity);

        const medicineAfter = await storage.getMedicine(item.medicineId);
        console.log(
          `After deduction - ${medicineAfter?.name}: ${medicineAfter?.stockQuantity}`
        );
      }

      const invoice = await storage.createInvoice(validatedData);
      console.log("Invoice created successfully:", invoice.id);

      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Debug endpoint to check current stock
  app.get("/api/debug/medicines", async (req, res) => {
    try {
      const medicines = await storage.getAllMedicines();
      const medicineInfo = medicines.map((med) => ({
        id: med.id,
        name: med.name,
        stock: med.stockQuantity,
        price: med.price,
      }));
      console.log("Current medicines stock:", medicineInfo);
      res.json(medicineInfo);
    } catch (error) {
      console.error("Error fetching debug info:", error);
      res.status(500).json({ error: "Failed to get debug info" });
    }
  });

  // Debug endpoint to check field mapping
  app.get("/api/debug/field-mapping", async (req, res) => {
    try {
      const medicines = await storage.getAllMedicines();
      const sampleMedicine = medicines[0];

      res.json({
        medicineFields: sampleMedicine
          ? Object.keys(sampleMedicine)
          : "No medicines",
        sampleMedicine: sampleMedicine,
        expectedFields: ["id", "name", "description", "price", "stockQuantity"],
      });
    } catch (error) {
      res.status(500).json({ error: "Debug failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
