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

  // ADD THIS ROUTE - Create new medicine
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

  // ADD THIS ROUTE - Delete medicine
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

  // Invoice routes (existing)
  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
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

  const httpServer = createServer(app);

  return httpServer;
}
