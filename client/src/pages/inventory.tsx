import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Dynamic rows for adding medicines
  const [rows, setRows] = useState([{ name: "", price: "", quantity: "" }]);

  // Pre-stored medicines (you can later connect API)
  const [storedMedicines, setStoredMedicines] = useState([]);

  const handleAddRow = () => {
    setRows([...rows, { name: "", price: "", quantity: "" }]);
  };

  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleSave = () => {
    const valid = rows.every((r) => r.name && r.price && r.quantity);

    if (!valid) {
      toast({
        title: "Missing Data",
        description: "Please fill all fields before saving",
        variant: "destructive",
      });
      return;
    }

    setStoredMedicines([...storedMedicines, ...rows]);
    setRows([{ name: "", price: "", quantity: "" }]);

    toast({
      title: "Saved",
      description: "Medicines added to inventory",
    });
  };

  const handleDeleteStored = (index) => {
    setStoredMedicines(storedMedicines.filter((_, i) => i !== index));
  };

  const handleBack = () => setLocation("/");

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      {/* <div className="min-h-screen bg-background pb-12"> */}
      <div className="bg-primary text-primary-foreground py-6 px-4 shadow-md mb-10">
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
      {/* <div className="max-w-4xl mx-auto flex items-center gap-4 mb-10">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div> */}

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Add New Medicines */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-end">
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

              <Button onClick={handleSave}>Save All</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stored Medicines Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stored Medicines</CardTitle>
          </CardHeader>

          <CardContent>
            {storedMedicines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No medicines added yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {storedMedicines.map((m, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{m.name}</td>
                        <td className="p-2">₹{m.price}</td>
                        <td className="p-2">{m.quantity}</td>

                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Update Stock
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteStored(index)}
                            >
                              Delete
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
