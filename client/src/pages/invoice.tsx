import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { type Medicine, type CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

/* ----------------------------- Small Helpers ---------------------------- */

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* --------------------------- Inline Popover UI -------------------------- */

const SimplePopover: React.FC<{
  triggerLabel: string;
  children: (close: () => void) => React.ReactNode;
  className?: string;
}> = ({ triggerLabel, children, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const close = () => setOpen(false);

  return (
    <div className={`relative inline-block ${className ?? ""}`} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 border p-2 rounded-md bg-white hover:bg-gray-50"
      >
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute z-50 mt-2 w-[320px] max-h-[340px] overflow-auto rounded-md border bg-white shadow-lg"
        >
          {children(close)}
        </div>
      )}
    </div>
  );
};

/* -------------------------- Inline Command UI --------------------------- */

type CommandProps = {
  items: Medicine[] | undefined;
  onSelect: (med: Medicine) => void;
  highlight?: string;
  className?: string;
};

const CommandList: React.FC<CommandProps> = ({
  items,
  onSelect,
  highlight = "",
  className,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-3 text-sm text-muted-foreground">
        No medicines found.
      </div>
    );
  }

  return (
    <div className={`divide-y ${className ?? ""}`}>
      {items.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{m.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              ₹{parseFloat(m.price).toFixed(2)} · Stock: {m.stockQuantity}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

/* --------------------------- Main Component ----------------------------- */

export default function Home(): JSX.Element {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stockErrors, setStockErrors] = useState<
    { medicineId: string; message: string }[]
  >([]);
  const [searchText, setSearchText] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: medicines, isLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  // derived selected medicine object
  const selectedMedicine = medicines?.find((m) => m.id === selectedMedicineId);

  /* ------------------------ Left dropdown content ----------------------- */
  const leftDropdownContent = (
    <div>
      <div className="p-2">
        <div className="text-xs text-muted-foreground px-1 pb-2">
          Select a medicine
        </div>
        <CommandList
          items={medicines}
          onSelect={(m) => {
            setSelectedMedicineId(m.id);
            setSearchText(m.name);
            setShowSuggestions(false);
          }}
        />
      </div>
    </div>
  );

  /* ---------------------- Autocomplete suggestion list ------------------- */
  const suggestionRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(suggestionRef, () => {});

  // Filter medicines for suggestions: by name includes searchText (case-ins)
  const suggestions =
    searchText.trim().length > 0 && medicines
      ? medicines.filter((m) =>
          m.name.toLowerCase().includes(searchText.trim().toLowerCase())
        )
      : [];

  /* ----------------------------- Handlers ------------------------------- */
  useEffect(() => {
    const savedCart = localStorage.getItem("invoiceCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("invoiceCart", JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = () => {
    if (!selectedMedicineId) {
      toast({
        title: "Selection Required",
        description: "Please select a medicine",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseInt(quantity, 10);
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

    // Check stock availability
    if (medicine.stockQuantity < quantityNum) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${medicine.stockQuantity} units available for ${medicine.name}`,
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = cart.findIndex(
      (item) => item.medicineId === selectedMedicineId
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingItemIndex].quantity + quantityNum;

      // Check if total quantity exceeds available stock
      if (medicine.stockQuantity < newQuantity) {
        toast({
          title: "Insufficient Stock",
          description: `Cannot add ${quantityNum} more units. Only ${
            medicine.stockQuantity - updatedCart[existingItemIndex].quantity
          } additional units available for ${medicine.name}`,
          variant: "destructive",
        });
        return;
      }

      updatedCart[existingItemIndex].quantity = newQuantity;
      updatedCart[existingItemIndex].amount =
        updatedCart[existingItemIndex].quantity *
        updatedCart[existingItemIndex].rate;
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

    // Clear stock errors for this medicine
    setStockErrors((prev) =>
      prev.filter((error) => error.medicineId !== selectedMedicineId)
    );

    // reset selection and quantity
    setSelectedMedicineId("");
    setQuantity("1");
    setSearchText("");
  };

  const handleRemoveFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
    // Clear stock error when item is removed
    setStockErrors((prev) =>
      prev.filter((error) => error.medicineId !== medicineId)
    );
    toast({
      title: "Removed",
      description: "Item removed from cart",
    });
  };

  const validateStockBeforeProceed = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/validate-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart }),
      });

      const result = await response.json();

      if (!result.valid) {
        const errors = result.details
          .filter((item: any) => !item.isValid)
          .map((item: any) => ({
            medicineId: item.medicineId,
            message: `Only ${item.availableStock} units available for ${item.medicineName} (requested: ${item.requestedQuantity})`,
          }));

        setStockErrors(errors);

        toast({
          title: "Insufficient Stock",
          description: "Some items in your cart exceed available stock",
          variant: "destructive",
        });

        return false;
      }

      setStockErrors([]);
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate stock availability",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleProceedToInvoice = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add at least one medicine to proceed",
        variant: "destructive",
      });
      return;
    }

    // Validate stock before proceeding
    const isStockValid = await validateStockBeforeProceed();
    if (!isStockValid) {
      return;
    }

    localStorage.setItem("invoiceCart", JSON.stringify(cart));
    setLocation("/generate-invoice");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  // Get available stock for display
  const getAvailableStock = (medicineId: string): number => {
    const medicine = medicines?.find((m) => m.id === medicineId);
    return medicine?.stockQuantity || 0;
  };

  // Get stock error for a specific medicine
  const getStockError = (medicineId: string) => {
    return stockErrors.find((error) => error.medicineId === medicineId);
  };

  /* ----------------------------- Render UI ------------------------------ */
  return (
    <div className="min-h-100 bg-[#00000033] p-[20px] sm:p-0 sm:min-h-[78.6vh]">
      {/* ---------- HEADER ---------- */}
      <Navbar active="invoice" title="Invoice Creation" />

      <div className="justify-items-center pt-10 sm:pt-[125px] pb-0 sm:pb-[27.99vh]">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-6xl w-[100%]">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Select Medicines</CardTitle>
              <CardDescription>
                Choose medicine and quantity to add to your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Medicine selector: left dropdown + right input with suggestions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Medicine Name</Label>

                <div className="flex items-start gap-2">
                  {/* LEFT: full list dropdown */}
                  <div className="relative flex-1" ref={suggestionRef}>
                    <Input
                      placeholder="Type to search medicine..."
                      value={searchText}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchText(value);
                        setShowSuggestions(true);
                        // If the input exactly matches a medicine name, set selection
                        const exact = medicines?.find(
                          (m) => m.name.toLowerCase() === value.toLowerCase()
                        );
                        if (exact) {
                          setSelectedMedicineId(exact.id);
                        } else {
                        }
                      }}
                      className="w-full"
                      aria-label="Search medicines"
                    />

                    {/* Suggestion box */}
                    {showSuggestions &&
                      searchText.trim().length > 0 &&
                      suggestions.length > 0 && (
                        <div className="absolute z-40 mt-1 w-full rounded-md border bg-white shadow">
                          <div className="max-h-[240px] overflow-auto">
                            <CommandList
                              items={suggestions}
                              onSelect={(m) => {
                                setSelectedMedicineId(m.id);
                                setSearchText(m.name);
                                setShowSuggestions(false);
                              }}
                            />
                          </div>
                        </div>
                      )}

                    {/* If search text present but no suggestions */}
                    {searchText.trim().length > 0 &&
                      suggestions.length === 0 && (
                        <div className="absolute z-40 mt-1 w-full rounded-md border bg-white shadow p-3 text-sm text-muted-foreground">
                          No medicines found.
                        </div>
                      )}
                  </div>

                  {/* RIGHT: text input with live suggestions */}

                  <SimplePopover
                    triggerLabel={selectedMedicine ? selectedMedicine.name : ""}
                  >
                    {(close) => (
                      <div className="p-2">
                        <div className="text-xs text-muted-foreground px-1 pb-2">
                          All medicines
                        </div>
                        <div className="max-h-[300px] overflow-auto">
                          <CommandList
                            items={medicines}
                            onSelect={(m) => {
                              setSelectedMedicineId(m.id);
                              setSearchText(m.name);
                              close();
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </SimplePopover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity-input" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity-input"
                  data-testid="input-quantity"
                  type="number"
                  min={1}
                  max={
                    selectedMedicineId
                      ? getAvailableStock(selectedMedicineId)
                      : undefined
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full"
                  placeholder="Enter quantity"
                />
                {selectedMedicineId && (
                  <p className="text-xs text-muted-foreground">
                    Available stock: {getAvailableStock(selectedMedicineId)}{" "}
                    units
                  </p>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={
                  isLoading ||
                  !selectedMedicineId ||
                  getAvailableStock(selectedMedicineId) === 0
                }
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
                {cart.length === 0
                  ? "No items added yet"
                  : `${cart.length} item${cart.length > 1 ? "s" : ""} in cart`}
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
                  {/* Stock Error Alert */}
                  {stockErrors.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Stock Issues</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {stockErrors.map((error, index) => (
                          <p key={index}>{error.message}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {cart.map((item) => {
                      const stockError = getStockError(item.medicineId);
                      const availableStock = getAvailableStock(item.medicineId);

                      return (
                        <div
                          key={item.medicineId}
                          data-testid={`cart-item-${item.medicineId}`}
                          className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${
                            stockError
                              ? "bg-destructive/10 border-destructive/20"
                              : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.medicineName}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Qty: {item.quantity}</span>
                              <span>×</span>
                              <span>₹{item.rate.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs">
                                Available: {availableStock} units
                              </span>
                              {stockError && (
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm whitespace-nowrap">
                              ₹{item.amount.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveFromCart(item.medicineId)
                              }
                              data-testid={`button-remove-${item.medicineId}`}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span
                        className="text-2xl font-bold text-primary"
                        data-testid="text-cart-total"
                      >
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={handleProceedToInvoice}
                      className="w-full"
                      size="lg"
                      data-testid="button-proceed"
                      disabled={stockErrors.length > 0}
                    >
                      Proceed to Invoice
                      <ArrowRight className="h-5 w-5" />
                    </Button>

                    {stockErrors.length > 0 && (
                      <p className="text-xs text-destructive text-center mt-2">
                        Please resolve stock issues before proceeding
                      </p>
                    )}
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
