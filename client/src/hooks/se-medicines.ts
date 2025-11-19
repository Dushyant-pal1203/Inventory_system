import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Medicine, InsertMedicine } from "@shared/schema";

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load medicines on component mount
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/medicines");
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        throw new Error("Failed to fetch medicines");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medicines",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedicine = async (medicineData: InsertMedicine) => {
    try {
      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicineData),
      });

      if (response.ok) {
        const newMedicine = await response.json();
        setMedicines((prev) => [...prev, newMedicine]);
        toast({
          title: "Success",
          description: "Medicine added successfully",
        });
        return newMedicine;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add medicine");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add medicine",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedicines((prev) => prev.filter((med) => med.id !== id));
        toast({
          title: "Success",
          description: "Medicine deleted successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete medicine");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete medicine",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    medicines,
    loading,
    addMedicine,
    deleteMedicine,
    refreshMedicines: loadMedicines,
  };
}
