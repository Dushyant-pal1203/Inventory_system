import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download } from "lucide-react";
import {
  type CartItem,
  type InsertInvoice,
  type Invoice,
  cartItemSchema,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/lib/pdfGenerator";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import "./generate_invoice.css";

export default function GenerateInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: InsertInvoice) => {
      const res = await apiRequest("POST", "/api/invoices", invoiceData);
      const data = await res.json();
      return data as Invoice;
    },
    onSuccess: () => {
      console.log("Invoice saved to backend successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to save invoice to backend:", error);
      toast({
        title: "Backend Error",
        description: "Failed to save invoice to server",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("invoiceCart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const validatedCart = z.array(cartItemSchema).parse(parsedCart);
        setCart(validatedCart);
      } catch (error) {
        console.error("Invalid cart data:", error);
        toast({
          title: "Invalid Cart Data",
          description: "Cart data is corrupted. Redirecting to home page.",
          variant: "destructive",
        });
        localStorage.removeItem("invoiceCart");
        setTimeout(() => setLocation("/"), 2000);
      }
    } else {
      toast({
        title: "No Items Found",
        description: "Redirecting to home page",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/"), 2000);
    }
  }, [setLocation, toast]);

  const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
  const taxPercentage = 5;
  const taxAmount = subtotal * (taxPercentage / 100);
  const totalDue = subtotal + taxAmount;

  const billNumber = `INV-${Date.now()}`;
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Replace your handleDownloadPDF function with this updated version:

  const handleDownloadPDF = async () => {
    if (!clientName || !clientAddress || !clientPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all client details",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Invoice",
      description: "Saving invoice and preparing PDF...",
    });

    try {
      const invoiceData: InsertInvoice = {
        billNumber,
        issueDate,
        clientName,
        clientAddress,
        clientPhone,
        items: cart,
        subtotal: subtotal.toString(),
        taxPercentage: taxPercentage.toString(),
        taxAmount: taxAmount.toString(),
        totalDue: totalDue.toString(),
      };

      const savedInvoice = (await createInvoiceMutation.mutateAsync(
        invoiceData
      )) as Invoice;

      if (!savedInvoice || !savedInvoice.id) {
        throw new Error("Invoice was not saved properly");
      }

      // Call the async generateInvoicePDF function
      await generateInvoicePDF({
        clientName,
        clientAddress,
        clientPhone,
        items: cart,
        billNumber,
        issueDate,
        subtotal,
        taxPercentage,
        taxAmount,
        totalDue,
      });

      toast({
        title: "Success!",
        description: "Invoice saved and PDF downloaded successfully",
      });

      localStorage.removeItem("invoiceCart");
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    setLocation("/invoice");
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-primary text-primary-foreground py-6 px-4 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            data-testid="button-back"
            className="text-primary-foreground border-primary-foreground/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Generate Invoice</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client-name">
                  Client Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="client-name"
                  data-testid="input-client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-phone">
                  Phone Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="client-phone"
                  data-testid="input-client-phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Enter phone number"
                  type="tel"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client-address">
                  Address <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="client-address"
                  data-testid="input-client-address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Enter client address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card id="invoice-preview">
          <div className="bg-primary text-primary-foreground px-6 py-8 rounded-t-xl">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <img
                src="images/logo.png"
                alt="Logo"
                className="w-[110px] h-fit"
              />
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                  MALKANI HEALTH OF ELECTROHOMEOPATHY & RESEARCH CENTRE
                </h2>
                <p className="text-sm mt-2 text-primary-foreground/90">
                  (64, Street No. 2, Vill- Sadipur Delhi 110094.)
                </p>
                <p className="text-xs mt-1 text-primary-foreground/80">
                  GSTIN:{" "}
                  <span style={{ color: "white", fontWeight: 700 }}>
                    07AHCPM0625Q1Z5
                  </span>
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold">INVOICE</h3>
            </div>
            {/* Watermark */}
            <div className="watermark">
              <img src="images/logo.png" alt="Watermark" />
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                  BILL TO:
                </h4>
                <div className="space-y-1 text-sm">
                  <p
                    className="font-medium"
                    data-testid="text-invoice-client-name"
                  >
                    {clientName || "_______________"}
                  </p>
                  <p className="text-muted-foreground">
                    {clientAddress || "_______________"}
                  </p>
                  <p className="text-muted-foreground">
                    {clientPhone || "_______________"}
                  </p>
                </div>
              </div>

              <div className="md:text-right">
                <div className="space-y-1 text-sm">
                  <div className="flex md:justify-end gap-2">
                    <span className="text-muted-foreground">Bill No:</span>
                    <span
                      className="font-medium"
                      data-testid="text-bill-number"
                    >
                      {billNumber}
                    </span>
                  </div>
                  <div className="flex md:justify-end gap-2">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span className="font-medium">{issueDate}</span>
                  </div>
                  <div className="flex md:justify-end gap-2">
                    <span className="text-muted-foreground">
                      Total Amount Due:
                    </span>
                    <span className="font-bold text-primary">
                      ₹{totalDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left px-4 py-3 font-semibold">
                      Description
                    </th>
                    <th className="text-center px-4 py-3 font-semibold">
                      Quantity
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Rate(Rs.)
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr
                      key={item.medicineId}
                      data-testid={`invoice-item-${index}`}
                      className={index % 2 === 0 ? "bg-muted/30" : ""}
                    >
                      <td className="px-4 py-3 border-b border-border">
                        {item.medicineName}
                      </td>
                      <td className="text-center px-4 py-3 border-b border-border">
                        {item.quantity}
                      </td>
                      <td className="text-right px-4 py-3 border-b border-border">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="text-right px-4 py-3 border-b border-border font-medium">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-muted-foreground">Sub Total</span>
                  <span className="font-medium" data-testid="text-subtotal">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-muted-foreground">
                    Tax {taxPercentage}%
                  </span>
                  <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2 border-primary">
                  <span className="text-lg font-semibold">Total Due</span>
                  <span
                    className="text-xl font-bold text-primary"
                    data-testid="text-total-due"
                  >
                    ₹{totalDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Our Payment Methods:
                </h4>
                <p className="text-sm text-muted-foreground">
                  Bank, BHIM #, PhonePe, Google Pay, NetBanking
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">NOTES:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Goods once sold will not be returned.</p>
                  <p>All disputes shall be subject to Delhi jurisdiction</p>
                  <p>
                    Please feel free to contact us in case of any question you
                    may have!
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pt-4">
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">
                    Thank you for your time & business!
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">Dr. Suresh Malkani</p>
                  <p className="text-xs text-muted-foreground">
                    Authorized Signer
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-b-xl text-center">
            <p className="text-xs">
              malkani.clinic@gmail.com | +91-9839239874 | +91-8800100378 |
              www.electrohomeopathy.in
            </p>
          </div>
        </Card>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleDownloadPDF}
            disabled={
              createInvoiceMutation.isPending ||
              !clientName ||
              !clientAddress ||
              !clientPhone
            }
            size="lg"
            className="px-8"
            data-testid="button-download-pdf"
          >
            <Download className="h-5 w-5" />
            {createInvoiceMutation.isPending
              ? "Generating PDF..."
              : "Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
