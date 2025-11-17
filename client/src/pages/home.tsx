import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { type Medicine, type CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: medicines, isLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const handleAddToCart = () => {
    if (!selectedMedicineId) {
      toast({
        title: "Selection Required",
        description: "Please select a medicine",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity (minimum 1)",
        variant: "destructive",
      });
      return;
    }

    const medicine = medicines?.find((m) => m.id === selectedMedicineId);
    if (!medicine) return;

    const existingItemIndex = cart.findIndex((item) => item.medicineId === selectedMedicineId);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantityNum;
      updatedCart[existingItemIndex].amount = updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].rate;
      setCart(updatedCart);
      toast({
        title: "Updated",
        description: `${medicine.name} quantity updated in cart`,
      });
    } else {
      const rate = parseFloat(medicine.price);
      const newItem: CartItem = {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: quantityNum,
        rate,
        amount: rate * quantityNum,
      };
      setCart([...cart, newItem]);
      toast({
        title: "Added to Cart",
        description: `${medicine.name} added successfully`,
      });
    }

    setSelectedMedicineId("");
    setQuantity("1");
  };

  const handleRemoveFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
    toast({
      title: "Removed",
      description: "Item removed from cart",
    });
  };

  const handleProceedToInvoice = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add at least one medicine to proceed",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem("invoiceCart", JSON.stringify(cart));
    setLocation("/invoice");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-8 px-4 shadow-md">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold">MALKANI HEALTH OF ELECTROHOMEOPATHY & RESEARCH CENTRE</h1>
          <p className="text-sm md:text-base mt-2 text-primary-foreground/90">(64, Street No. 2, Vill- Sadipur Delhi 110094.)</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Select Medicines</CardTitle>
              <CardDescription>Choose medicine and quantity to add to your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medicine-select" className="text-sm font-medium">
                  Medicine Name
                </Label>
                <Select
                  value={selectedMedicineId}
                  onValueChange={setSelectedMedicineId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="medicine-select" data-testid="select-medicine" className="w-full">
                    <SelectValue placeholder={isLoading ? "Loading medicines..." : "Select a medicine"} />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines?.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        {medicine.name} - ₹{parseFloat(medicine.price).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity-input" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity-input"
                  data-testid="input-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full"
                  placeholder="Enter quantity"
                />
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full"
                size="lg"
                data-testid="button-add-medicine"
              >
                <Plus className="h-5 w-5" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShoppingCart className="h-6 w-6" />
                Cart Summary
              </CardTitle>
              <CardDescription>
                {cart.length === 0 ? "No items added yet" : `${cart.length} item${cart.length > 1 ? "s" : ""} in cart`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs mt-1">Add medicines to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div
                        key={item.medicineId}
                        data-testid={`cart-item-${item.medicineId}`}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.medicineName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>Qty: {item.quantity}</span>
                            <span>×</span>
                            <span>₹{item.rate.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm whitespace-nowrap">
                            ₹{item.amount.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromCart(item.medicineId)}
                            data-testid={`button-remove-${item.medicineId}`}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary" data-testid="text-cart-total">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={handleProceedToInvoice}
                      className="w-full"
                      size="lg"
                      data-testid="button-proceed"
                    >
                      Proceed to Invoice
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
