import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";

interface NavbarProps {
  active: "home" | "inventory" | "invoice" | "bills" | "contact";
  onBack?: () => void;
  title?: string;
}

export default function Navbar({ active, onBack, title }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/", key: "home" },
    { label: "Inventory", href: "/inventory", key: "inventory" },
    { label: "Invoice", href: "/invoice", key: "invoice" },
    { label: "Bills", href: "/bills", key: "bills" },
    { label: "Contact Us", href: "/contact_us", key: "contact" },
  ];

  return (
    <>
      {/* Main Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 shadow-md fixed top-0 left-0 w-full z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Back Button */}
          <div className="w-[30%] text-left hidden sm:flex">
            <Button
              variant="ghost"
              onClick={onBack || (() => (window.location.href = "/"))}
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 hidden sm:flex"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </Button>
          </div>
          {/* Logo */}
          <div
            onClick={() => (window.location.href = "/")}
            className="hidden sm:block cursor-pointer w-[30%]  justify-items-center"
          >
            <img
              src="images/logo.png"
              alt="Logo"
              className="w-[66px] h-[55px]"
            />
          </div>

          {/* Title */}
          <div className=" sm:w-[31%] text-left sm:text-right">
            <h1 className="text-xl md:text-3xl font-bold ">
              {title || "My Website"}
            </h1>
          </div>

          {/* Mobile Menu Button */}
          <button className="sm:hidden" onClick={() => setOpen(!open)}>
            <Menu className="h-7 w-7 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="w-full items-center justify-between gap-4 fixed top-[60px] left-0 z-10">
        <div className="max-w-6xl mx-auto">
          <nav>
            <ul className="hidden sm:flex items-center justify-end space-x-4 mt-2">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Button
                    onClick={() => (window.location.href = item.href)}
                    variant={active === item.key ? "outline" : "default"}
                    className={
                      active === item.key
                        ? "text-primary !border-primary bg-white"
                        : ""
                    }
                  >
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>

            {/* Mobile Dropdown */}
            {open && (
              <ul className="sm:hidden flex flex-col bg-white shadow-md p-4 space-y-2 mt-[-16px]">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Button
                      onClick={() => (window.location.href = item.href)}
                      variant={active === item.key ? "outline" : "default"}
                      className={
                        active === item.key
                          ? "text-primary !border-primary w-full"
                          : "w-full"
                      }
                    >
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
