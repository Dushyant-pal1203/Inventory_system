import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Plus,
  Edit,
  Save,
  Undo2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMedicines } from "../hooks/se-medicines";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";

interface MedicineRow {
  name: string;
  description: string;
  price: string;
  quantity: string;
}

interface EditValues {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
}

export default function Inventory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { medicines, loading, addMedicine, updateMedicine, deleteMedicine } =
    useMedicines();

  const [rows, setRows] = useState<MedicineRow[]>([
    { name: "", description: "", price: "", quantity: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditValues>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
  });

  // Add state for delete modal and file upload
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // New state for CSV upload modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load "Don't show again" preference from localStorage on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("csvUploadDontShowAgain");
    if (savedPreference === "true") {
      setDontShowAgain(true);
    }
  }, []);

  const handleAddRow = () => {
    setRows([...rows, { name: "", description: "", price: "", quantity: "" }]);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (
    index: number,
    field: keyof MedicineRow,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const validateRow = (row: MedicineRow): boolean => {
    return !!(row.name.trim() && row.price && row.quantity);
  };

  const handleSave = async () => {
    // Filter out empty rows and validate
    const rowsToSave = rows.filter(
      (row) =>
        row.name.trim() || row.description.trim() || row.price || row.quantity
    );

    if (rowsToSave.length === 0) {
      toast({
        title: "No Data",
        description: "Please add at least one medicine to save",
        variant: "destructive",
      });
      return;
    }

    const allValid = rowsToSave.every(validateRow);
    if (!allValid) {
      toast({
        title: "Missing Data",
        description: "Please fill name, price, and quantity for all medicines",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      for (const row of rowsToSave) {
        if (validateRow(row)) {
          await addMedicine({
            name: row.name.trim(),
            description: row.description.trim(),
            price: row.price.trim() || "0",
            stockQuantity: parseInt(row.quantity) || 0,
          } as any);
        }
      }

      toast({
        title: "Success",
        description: `${rowsToSave.length} medicine(s) added successfully`,
      });

      // Reset to one empty row
      setRows([{ name: "", description: "", price: "", quantity: "" }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save medicines",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (medicine: any) => {
    setEditingId(medicine.id);
    setEditValues({
      name: medicine.name,
      description: medicine.description || "",
      price: medicine.price.toString(),
      stockQuantity: medicine.stockQuantity.toString(),
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      // Validate edit values
      if (
        !editValues.name.trim() ||
        !editValues.price ||
        !editValues.stockQuantity
      ) {
        toast({
          title: "Missing Data",
          description: "Please fill name, price, and quantity",
          variant: "destructive",
        });
        return;
      }

      await updateMedicine(id, {
        name: editValues.name.trim(),
        description: editValues.description.trim(),
        price: editValues.price,
        stockQuantity: parseInt(editValues.stockQuantity) || 0,
      });

      toast({
        title: "Success",
        description: "Medicine updated successfully",
      });

      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Updated delete function with modal
  const handleDeleteClick = (id: string) => {
    setMedicineToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteMedicine = async () => {
    if (!medicineToDelete) return;

    try {
      await deleteMedicine(medicineToDelete);
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
      setDeleteModalOpen(false);
      setMedicineToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setMedicineToDelete(null);
  };

  // Handle CSV upload button click
  const handleUploadCsvClick = () => {
    if (dontShowAgain) {
      // If "Don't show again" is checked, directly trigger file input
      document.getElementById("csv-upload")?.click();
    } else {
      // Otherwise, show the modal
      setCsvModalOpen(true);
    }
  };

  // Handle CSV modal confirmation
  const handleCsvModalConfirm = () => {
    setCsvModalOpen(false);

    if (dontShowAgain) {
      localStorage.setItem("csvUploadDontShowAgain", "true");
    }

    setTimeout(() => {
      document.getElementById("csv-upload")?.click();
    }, 0);
  };

  // CSV file upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is CSV format
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

      // Validate headers
      const requiredHeaders = ["name", "price", "quantity"];
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        toast({
          title: "Invalid CSV Format",
          description: `Missing required columns: ${missingHeaders.join(
            ", "
          )}. Required columns: name, price, quantity`,
          variant: "destructive",
        });
        return;
      }

      const medicines = [];
      let errorRows: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const medicine: any = {};

        headers.forEach((header, index) => {
          medicine[header] = values[index] || "";
        });

        // Validate required fields
        if (!medicine.name || !medicine.price || !medicine.quantity) {
          errorRows.push(`Row ${i + 1}: Missing required fields`);
          continue; // Skip to next row
        }

        const price = parseFloat(medicine.price);
        const quantity = parseInt(medicine.quantity);

        if (isNaN(price) || price < 0) {
          errorRows.push(`Row ${i + 1}: Invalid price value`);
          continue;
        }

        if (isNaN(quantity) || quantity < 0) {
          errorRows.push(`Row ${i + 1}: Invalid quantity value`);
          continue;
        }

        medicines.push({
          name: medicine.name,
          description: medicine.description || "",
          price: price.toFixed(2),
          stockQuantity: quantity,
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

      if (medicines.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid medicine records found in CSV file",
          variant: "destructive",
        });
        return;
      }

      // Use your existing addMedicine function for each medicine
      let successCount = 0;
      let failedMedicines = [];

      for (const medicine of medicines) {
        try {
          await addMedicine(medicine as any);
          successCount++;
        } catch (error) {
          console.error(`Failed to add medicine: ${medicine.name}`, error);
          failedMedicines.push(medicine.name);
        }
      }

      if (failedMedicines.length > 0) {
        toast({
          title: "Partial Success",
          description: `Successfully uploaded ${successCount} medicines. Failed to upload: ${failedMedicines
            .slice(0, 3)
            .join(", ")}${failedMedicines.length > 3 ? "..." : ""}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully uploaded ${successCount} medicines from CSV file`,
        });
      }

      // Reset form and refresh data
      setRows([{ name: "", description: "", price: "", quantity: "" }]);
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

  // Export CSV function
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = ["Name", "Description", "Price", "Quantity"];
      const csvContent = [
        headers.join(","),
        ...medicines.map((medicine) =>
          [
            `"${medicine.name.replace(/"/g, '""')}"`,
            `"${(medicine.description || "").replace(/"/g, '""')}"`,
            medicine.price,
            medicine.stockQuantity,
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
        `medicines-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `Exported ${medicines.length} medicines to CSV file`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export medicines to CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(medicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMedicines = medicines.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    // Always show first page
    pages.push(1);

    // Calculate start and end of visible page range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're near the start
    if (currentPage <= 2) {
      endPage = Math.min(totalPages - 1, maxVisiblePages);
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 1);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push("ellipsis-start");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-[100vh] bg-[#00000033] p-[20px] sm:p-0 sm:min-h-[80.6vh]">
      {/* ---------- HEADER ---------- */}
      <Navbar active="inventory" title="Inventory Management" />

      {/* ---------- MAIN CONTENT ---------- */}

      <div className="max-w-6xl mx-auto space-y-10 pt-10 sm:pt-[125px] pb-0- sm:pb-4">
        {/* Add New Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Medicines</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
              >
                <div>
                  <Label htmlFor={`name-${index}`}>
                    Name <span className="text-secondary">*</span>
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={row.name}
                    onChange={(e) =>
                      handleRowChange(index, "name", e.target.value)
                    }
                    placeholder="Medicine Name"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={row.description}
                    onChange={(e) =>
                      handleRowChange(index, "description", e.target.value)
                    }
                    placeholder="Medicine Description"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor={`price-${index}`}>
                    Price <span className="text-secondary">*</span>
                  </Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(e) =>
                      handleRowChange(index, "price", e.target.value)
                    }
                    placeholder="₹ Price"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor={`quantity-${index}`}>
                    Quantity <span className="text-secondary">*</span>
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0"
                    value={row.quantity}
                    onChange={(e) =>
                      handleRowChange(index, "quantity", e.target.value)
                    }
                    placeholder="Stock Qty"
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end">
                  {rows.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteRow(index)}
                      className="h-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleAddRow}
                  className="hover:bg-primary hover:text-white text-primary !border-primary"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Row
                </Button>

                {/* CSV Upload Button */}
                <Button
                  variant="destructive"
                  className="hover:bg-gray-100 hover:border-secondary hover:text-secondary text-white"
                  onClick={handleUploadCsvClick}
                  disabled={uploading}
                >
                  <Download className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload CSV"}
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Button>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Medicines"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stored Medicines Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stored Medicines</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 h-[26vh]">
                <p className="text-muted-foreground">Loading medicines...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-8 h-[26vh]">
                <p className="text-muted-foreground">No medicines added yet.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentMedicines.map((medicine: any) => {
                        const isEditing = editingId === medicine.id;

                        return (
                          <tr
                            key={medicine.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-3">
                              {isEditing ? (
                                <Input
                                  value={editValues.name}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Medicine Name"
                                />
                              ) : (
                                <span className="font-medium">
                                  {medicine.name}
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              {isEditing ? (
                                <Input
                                  value={editValues.description}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Description"
                                />
                              ) : (
                                medicine.description || (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )
                              )}
                            </td>

                            <td className="p-3 text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editValues.price}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      price: e.target.value,
                                    })
                                  }
                                  className="text-right"
                                />
                              ) : (
                                `₹${parseFloat(medicine.price).toFixed(2)}`
                              )}
                            </td>

                            <td className="p-3 text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  min="0"
                                  value={editValues.stockQuantity}
                                  onChange={(e) =>
                                    setEditValues({
                                      ...editValues,
                                      stockQuantity: e.target.value,
                                    })
                                  }
                                  className="text-right"
                                />
                              ) : (
                                medicine.stockQuantity
                              )}
                            </td>

                            <td className="p-3">
                              <div className="flex gap-2 justify-center">
                                {isEditing ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleSaveEdit(medicine.id)
                                      }
                                      className="hover:bg-primary hover:text-white text-primary !border-primary"
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={handleCancelEdit}
                                      className="hover:bg-gray-100 hover:border-secondary hover:text-secondary text-white"
                                    >
                                      <Undo2 className="h-4 w-4 mr-1" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditClick(medicine)}
                                      className="hover:bg-primary hover:text-white text-primary !border-primary"
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteClick(medicine.id)
                                      }
                                      className="hover:bg-gray-100 hover:border-secondary hover:text-secondary text-white !z-2"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row gap-1 items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(startIndex + itemsPerPage, medicines.length)} of{" "}
                      {medicines.length} medicines
                    </div>
                    {/* Export CSV Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={exporting || medicines.length === 0}
                      className="flex items-center gap-1 hover:bg-primary hover:text-white text-primary !border-primary"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {exporting ? "Exporting..." : "Export CSV"}
                    </Button>
                    <div className="flex items-center gap-4">
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
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page as number)}
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

                {/* Export button for when there's only one page */}
                {totalPages <= 1 && medicines.length > 0 && (
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={exporting}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      {exporting ? "Exporting..." : "Export CSV"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medicine? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedicine}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Help Modal */}
      <Dialog open={csvModalOpen} onOpenChange={setCsvModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CSV File Format</DialogTitle>
            <DialogDescription>
              Please ensure your CSV file follows the correct format for
              successful upload.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">CSV File Format:</h4>
            <p className="text-sm text-blue-700 mb-2">
              Your CSV file should have the following columns:{" "}
              <strong>name, price, quantity</strong> (description is optional)
            </p>
            <div className="text-xs bg-white p-2 rounded border">
              <code>
                name,description,price,quantity
                <br />
                Paracetamol,Pain relief medicine,25.50,100
                <br />
                Aspirin,Headache medicine,15.75,50
                <br />
                Vitamin C,Immune booster,12.00,200
              </code>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) =>
                setDontShowAgain(checked as boolean)
              }
            />
            <Label htmlFor="dont-show-again" className="text-sm">
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
  );
}
