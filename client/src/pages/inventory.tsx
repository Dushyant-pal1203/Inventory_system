import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMedicines } from "../hooks/se-medicines";

interface MedicineRow {
  name: string;
  description: string;
  price: string;
  quantity: string;
}

export default function Inventory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { medicines, loading, addMedicine, deleteMedicine } = useMedicines();

  // Dynamic rows for adding medicines
  const [rows, setRows] = useState<MedicineRow[]>([
    { name: "", description: "", price: "", quantity: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { name: "", description: "", price: "", quantity: "" }]);
  };

  const handleDeleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
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

  const handleSave = async () => {
    // Validate all rows
    const valid = rows.every((r) => r.name && r.price && r.quantity);

    if (!valid) {
      toast({
        title: "Missing Data",
        description: "Please fill all fields before saving",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Save each medicine individually
      for (const row of rows) {
        await addMedicine({
          name: row.name,
          price: row.price,
          stockQuantity: parseInt(row.quantity) || 0,
        });
      }

      // Reset rows after successful save
      setRows([{ name: "", description: "", price: "", quantity: "" }]);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStored = async (id: string) => {
    await deleteMedicine(id);
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
            className="text-primary-foreground border-primary-foreground/20"
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

      <div className="max-w-4xl mx-auto space-y-10 mt-[110px]">
        {/* Add New Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {rows.map((row, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={row.name}
                    onChange={(e) =>
                      handleRowChange(index, "name", e.target.value)
                    }
                    placeholder="Medicine Name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={row.description}
                    onChange={(e) =>
                      handleRowChange(index, "description", e.target.value)
                    }
                    placeholder="Medicine Description"
                  />
                </div>

                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={row.price}
                    onChange={(e) =>
                      handleRowChange(index, "price", e.target.value)
                    }
                    placeholder="₹ Price"
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      handleRowChange(index, "quantity", e.target.value)
                    }
                    placeholder="Stock Qty"
                  />
                </div>

                {/* Delete Row Button (except first row) */}
                <div className="flex justify-end">
                  {index > 0 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleAddRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save All"}
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
              <p className="text-muted-foreground text-sm">
                Loading medicines...
              </p>
            ) : medicines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No medicines added yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border text-center">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {medicines.map((medicine) => (
                      <tr key={medicine.id} className="border-b">
                        <td className="p-2 text-start">{medicine.name}</td>
                        {/* <td className="p-2">{medicine.description}</td> */}
                        <td className="p-2">₹{medicine.price}</td>
                        <td className="p-2">{medicine.stockQuantity}</td>

                        <td className="p-2">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-green-600 hover:text-white text-[#16A249]"
                            >
                              <Edit className="h-4 w-4 " />
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="hover:bg-red-300 hover:text-red-600 text-white"
                              onClick={() => handleDeleteStored(medicine.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
