import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Boxes, FileText, Receipt } from "lucide-react";
import { useLocation } from "wouter";
import Banner from "../components/banner";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <>
      <Banner />
      <div className="bg-[#00000033] flex items-center justify-center px-4 py-4 min-h-[49.2vh]">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6 justify-items-center">
          {/* Inventory Option */}
          <Card
            className="cursor-pointer hover:shadow-lg transition w-full max-w-sm"
            onClick={() => setLocation("/inventory")}
          >
            <CardHeader className="text-center space-y-3">
              <Boxes className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="text-2xl">Inventory</CardTitle>
              <CardDescription>Manage medicines and stock</CardDescription>
              <Button className="w-full mt-4">
                Go to Inventory <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
          </Card>

          {/* Invoice Option */}
          <Card
            className="cursor-pointer hover:shadow-lg transition w-full max-w-sm"
            onClick={() => setLocation("/invoice")}
          >
            <CardHeader className="text-center space-y-3">
              <FileText className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="text-2xl">Invoice</CardTitle>
              <CardDescription>Create new invoices</CardDescription>
              <Button className="w-full mt-4">
                Go to Invoice <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
          </Card>

          {/* Bill Records Option */}
          <Card
            className="cursor-pointer hover:shadow-lg transition w-full max-w-sm md:col-span-2 md:justify-self-center"
            onClick={() => setLocation("/bills")}
          >
            <CardHeader className="text-center space-y-3">
              <Receipt className="h-12 w-12 mx-auto text-primary" />
              <CardTitle className="text-2xl">Bill Records</CardTitle>
              <CardDescription>
                View all bill history and records
              </CardDescription>
              <Button className="w-full mt-4">
                View Bills <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
