import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import "./bill.css";

interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  date: string;
  totalAmount: number;
  items: BillItem[];
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  issueDate?: string;
  subtotal?: string;
  taxPercentage?: string;
  taxAmount?: string;
  totalDue?: string;
}

interface BillItem {
  medicineName: string;
  quantity: number;
  price: number;
  total: number;
  medicineId?: string;
  rate?: number;
  amount?: number;
}

export default function Bills() {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  // CSV upload modal state
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load bills from API
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/invoices");
      if (response.ok) {
        const invoices = await response.json();

        // Transform invoices to bills format
        const transformedBills: Bill[] = invoices.map((invoice: any) => ({
          id: invoice.id,
          billNumber: invoice.billNumber,
          customerName: invoice.clientName,
          date: invoice.issueDate,
          totalAmount: parseFloat(invoice.totalDue) || 0,
          items:
            invoice.items?.map((item: any) => ({
              medicineName: item.medicineName,
              quantity: item.quantity,
              price: item.rate || 0,
              total: item.amount || 0,
              medicineId: item.medicineId,
              rate: item.rate,
              amount: item.amount,
            })) || [],
          clientName: invoice.clientName,
          clientAddress: invoice.clientAddress,
          clientPhone: invoice.clientPhone,
          issueDate: invoice.issueDate,
          subtotal: invoice.subtotal,
          taxPercentage: invoice.taxPercentage,
          taxAmount: invoice.taxAmount,
          totalDue: invoice.totalDue,
        }));

        setBills(transformedBills);
      } else {
        throw new Error("Failed to fetch bills");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load "Don't show again" preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem("billsCsvUploadDontShowAgain");
    if (savedPreference === "true") {
      setDontShowAgain(true);
    }
  }, []);

  const handleBack = () => {
    window.location.href = "/";
  };

  // Handle CSV upload button click
  const handleUploadCsvClick = () => {
    if (dontShowAgain) {
      document.getElementById("bills-csv-upload")?.click();
    } else {
      setCsvModalOpen(true);
    }
  };

  // Handle CSV modal confirmation
  const handleCsvModalConfirm = () => {
    setCsvModalOpen(false);

    if (dontShowAgain) {
      localStorage.setItem("billsCsvUploadDontShowAgain", "true");
    }

    setTimeout(() => {
      document.getElementById("bills-csv-upload")?.click();
    }, 0);
  };

  // View PDF function
  const handleViewPDF = async (bill: Bill) => {
    try {
      setViewingPdf(bill.id);

      // Recreate the invoice data structure for PDF generation
      const invoiceData = {
        clientName: bill.clientName || bill.customerName,
        clientAddress: bill.clientAddress || "",
        clientPhone: bill.clientPhone || "",
        items: bill.items.map((item) => ({
          medicineName: item.medicineName,
          quantity: item.quantity,
          rate: item.price,
          amount: item.total,
          medicineId: item.medicineId ?? "",
        })),
        billNumber: bill.billNumber,
        issueDate: bill.date,
        subtotal:
          parseFloat(bill.subtotal || "0") ||
          bill.items.reduce((sum, item) => sum + item.total, 0),
        taxPercentage: 5, // Default tax percentage
        taxAmount: parseFloat(bill.taxAmount || "0") || 0,
        totalDue: bill.totalAmount,
      };

      // Import the PDF generator dynamically to avoid circular dependencies
      const { generateInvoicePDF } = await import("@/lib/pdfGenerator");

      await generateInvoicePDF(invoiceData);

      toast({
        title: "PDF Generated",
        description: "PDF has been generated and downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setViewingPdf(null);
    }
  };

  // CSV file upload handler for bills
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        toast({
          title: "Empty File",
          description: "CSV file is empty or has no data rows",
          variant: "destructive",
        });
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Validate headers for bills
      const requiredHeaders = [
        "billnumber",
        "customername",
        "date",
        "totalamount",
      ];
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(
            ", "
          )}. Required columns: billNumber, customerName, date, totalAmount`,
          variant: "destructive",
        });
        return;
      }

      const importedBills: Bill[] = [];
      let errorRows: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const billData: any = {};

        headers.forEach((header, index) => {
          billData[header] = values[index] || "";
        });

        // Validate required fields
        if (
          !billData.billnumber ||
          !billData.customername ||
          !billData.date ||
          !billData.totalamount
        ) {
          errorRows.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        const totalAmount = parseFloat(billData.totalamount);

        if (isNaN(totalAmount) || totalAmount < 0) {
          errorRows.push(`Row ${i + 1}: Invalid total amount`);
          continue;
        }

        // Parse items if provided (optional field) - handle gracefully
        let items: BillItem[] = [];
        if (
          billData.items &&
          billData.items.trim() !== "" &&
          billData.items !== "[]"
        ) {
          try {
            let itemsString = billData.items.trim();

            // Remove surrounding quotes if present
            if (itemsString.startsWith('"') && itemsString.endsWith('"')) {
              itemsString = itemsString.slice(1, -1);
            }

            // Handle double-escaped JSON
            itemsString = itemsString
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\");

            // Try to parse as JSON
            const parsedItems = JSON.parse(itemsString);

            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              items = parsedItems.map((item: any) => ({
                medicineName: item.medicineName || item.medicineName || "",
                quantity: Number(item.quantity) || 0,
                price: Number(item.price) || Number(item.rate) || 0,
                total: Number(item.total) || Number(item.amount) || 0,
                medicineId: item.medicineId || "",
                rate: item.rate || item.price || 0,
                amount: item.amount || item.total || 0,
              }));
            }
          } catch (error) {
            console.warn(
              `Row ${i + 1}: Could not parse items, using empty array`
            );
            // Don't treat this as a fatal error - continue with empty items
          }
        }

        importedBills.push({
          id: `imported-${Date.now()}-${i}`,
          billNumber: billData.billnumber,
          customerName: billData.customername,
          date: billData.date,
          totalAmount: totalAmount,
          items: items,
        });
      }

      if (errorRows.length > 0) {
        toast({
          title: "Validation Errors",
          description: `Found ${
            errorRows.length
          } error(s) in CSV file. First few: ${errorRows
            .slice(0, 3)
            .join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      if (importedBills.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid bill records found in CSV file",
          variant: "destructive",
        });
        return;
      }

      // Add imported bills to state (replace with your actual API call)
      setBills((prevBills) => [...prevBills, ...importedBills]);

      toast({
        title: "Success",
        description: `Successfully imported ${importedBills.length} bills from CSV file`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Export CSV function for bills - UPDATED VERSION
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Create CSV content for bills with correct headers
      const headers = [
        "billNumber",
        "customerName",
        "date",
        "totalAmount",
        "items",
      ];

      const csvContent = [
        headers.join(","),
        ...bills.map((bill) =>
          [
            `"${bill.billNumber.replace(/"/g, '""')}"`,
            `"${bill.customerName.replace(/"/g, '""')}"`,
            bill.date,
            bill.totalAmount.toFixed(2),
            `"${JSON.stringify(bill.items).replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `bills-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${bills.length} bills to CSV file`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export bills to CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBills = bills.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 2) {
      endPage = Math.min(totalPages - 1, maxVisiblePages);
    }

    if (currentPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 1);
    }

    if (startPage > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      <div className="min-h-[100vh] bg-background p-[20px] sm:p-0 sm:min-h-[80.6vh]">
        {/* Header */}
        <div className="w-full  tems-center justify-between gap-4 fixed top-[60px] left-0 !z-10">
          <div className="max-w-6xl mx-auto ">
            <nav>
              <ul className="flex items-center justify-end space-x-4 mt-2">
                <li>
                  <Button onClick={() => (window.location.href = "/")}>
                    Home
                  </Button>
                </li>
                <li>
                  <Button onClick={() => (window.location.href = "/inventory")}>
                    Inventory
                  </Button>
                </li>
                <li>
                  <Button onClick={() => (window.location.href = "/invoice")}>
                    Invoice
                  </Button>
                </li>
                <li>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/bills")}
                    className="text-primary !border-primary"
                  >
                    Bills
                  </Button>
                </li>
                <li>
                  <Button
                    onClick={() => (window.location.href = "/contact_us")}
                  >
                    Contact Us
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="bg-primary text-primary-foreground py-2 px-4 shadow-md fixed top-0 left-0 w-full z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              data-testid="button-back"
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <div
              onClick={() => {
                window.location.href = "/";
              }}
              className="hidden sm:block cursor-pointer"
            >
              <img
                src="images/logo.png"
                alt="Logo"
                className="w-[65px] h-[55px]"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Bills Management</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-24 pb-8 px-4 min-h-[95.5vh] bg-background">
          <div className="max-w-6xl mx-auto space-y-6 mt-6">
            {/* Bills Table Card */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Bills Records</CardTitle>
                <div className="flex gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Button
                      variant="destructive"
                      onClick={handleUploadCsvClick}
                      disabled={uploading}
                      className="hover:bg-gray-100 hover:border-secondary hover:text-secondary text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload CSV"}
                    </Button>
                    <Input
                      id="bills-csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {/* Export button for when there's only one page */}
                  {totalPages <= 1 && bills.length > 0 && (
                    <div className="">
                      <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className="flex items-center gap-1 hover:bg-primary hover:text-white text-primary !border-primary"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {exporting ? "Exporting..." : "Export CSV"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <div>
                <form className="bill-search" action="">
                  <input type="search" placeholder="Search here...." />
                  <i className="fa fa-search">
                    <Search />
                  </i>
                </form>
              </div>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading bills...</p>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bills found.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-3 text-left">Bill Number</th>
                            <th className="p-3 text-left">Customer Name</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-right">Total Amount</th>
                            <th className="p-3 text-left">Items Count</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentBills.map((bill) => (
                            <tr
                              key={bill.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="p-3 font-medium">
                                {bill.billNumber}
                              </td>
                              <td className="p-3">{bill.customerName}</td>
                              <td className="p-3">{bill.date}</td>
                              <td className="p-3 text-right">
                                ₹{bill.totalAmount.toFixed(2)}
                              </td>
                              <td className="p-3">{bill.items.length} items</td>
                              <td className="p-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPDF(bill)}
                                  disabled={viewingPdf === bill.id}
                                  className="flex items-center gap-1 hover:bg-primary hover:text-white text-primary !border-primary"
                                >
                                  {viewingPdf === bill.id ? (
                                    <FileText className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                  {viewingPdf === bill.id
                                    ? "Generating..."
                                    : "View PDF"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination and Export */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(startIndex + itemsPerPage, bills.length)} of{" "}
                          {bills.length} bills
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Export CSV Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCSV}
                            disabled={exporting || bills.length === 0}
                            className="flex items-center gap-1 hover:bg-primary hover:text-white text-primary !border-primary"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {exporting ? "Exporting..." : "Export CSV"}
                          </Button>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1 hover:bg-primary hover:text-white text-primary !border-primary"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>

                            <div className="flex items-center space-x-1">
                              {renderPageNumbers().map((page, index) => {
                                if (
                                  page === "ellipsis-start" ||
                                  page === "ellipsis-end"
                                ) {
                                  return (
                                    <span
                                      key={`ellipsis-${index}`}
                                      className="px-2 text-muted-foreground"
                                    >
                                      ...
                                    </span>
                                  );
                                }

                                return (
                                  <Button
                                    key={page}
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                      handlePageChange(page as number)
                                    }
                                    className="w-8 h-8 p-0"
                                  >
                                    {page}
                                  </Button>
                                );
                              })}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1 hover:bg-primary hover:text-white text-primary !border-primary"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CSV Upload Help Modal */}
        <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bills CSV File Format</DialogTitle>
              <DialogDescription>
                Please ensure your CSV file follows the correct format for
                successful upload.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                CSV File Format:
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Your CSV file should have the following columns:{" "}
                <strong>billNumber, customerName, date, totalAmount</strong>{" "}
                (items is optional)
              </p>
              <div className="text-xs bg-white p-2 rounded border">
                <code>
                  billNumber,customerName,date,totalAmount
                  <br />
                  INV-001,John Doe,26/11/2024,150.75
                  <br />
                  INV-002,Jane Smith,27/11/2024,89.50
                  <br />
                  INV-003,Robert Johnson,28/11/2024,200.00
                </code>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Note: The items column is optional. If provided, it should be a
                valid JSON array.
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="bills-dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={(checked) =>
                  setDontShowAgain(checked as boolean)
                }
              />
              <Label htmlFor="bills-dont-show-again" className="text-sm">
                Don't show this message again
              </Label>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setCsvModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCsvModalConfirm}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
