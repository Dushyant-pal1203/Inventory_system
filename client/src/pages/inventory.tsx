import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowLeft, Edit, Save, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMedicines } from "../hooks/se-medicines";

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
          // Cast payload to any to satisfy addMedicine's parameter type
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

  // Editing medicines is not supported because updateMedicine is not available.
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

  const handleDeleteMedicine = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine(id);
        toast({
          title: "Success",
          description: "Medicine deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete medicine",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => setLocation("/");

  return (
    <div className="min-h-[100vh] bg-background p-[20px] sm:p-0 sm:min-h-[80.6vh]">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-4 shadow-md fixed top-0 left-0 w-full z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            data-testid="button-back"
            className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">
              Inventory Management
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10 mt-[110px]">
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
                    Name <span className="text-red-600">*</span>
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
                    Price <span className="text-red-600">*</span>
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
                    Quantity <span className="text-red-600">*</span>
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

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleAddRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>

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
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading medicines...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No medicines added yet.</p>
              </div>
            ) : (
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
                    {medicines.map((medicine: any) => {
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
                                <span className="text-muted-foreground">-</span>
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
                                    onClick={() => handleSaveEdit(medicine.id)}
                                    className="hover:bg-green-600 hover:text-white text-green-600 !border-green-600"
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="hover:bg-gray-100 hover:border-red-600 hover:text-red-600 text-white"
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
                                    className="hover:bg-green-600 hover:text-white text-green-600 !border-green-600"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteMedicine(medicine.id)
                                    }
                                    className="hover:bg-gray-100 hover:border-red-600 hover:text-red-600 text-white"
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
