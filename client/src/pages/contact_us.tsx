import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPinHouse,
  Mail,
  PrinterCheck,
  Smartphone,
} from "lucide-react";
import React from "react";

const handleBack = () => {
  window.location.href = "/";
};

const ContactUs = () => {
  return (
    <>
      <div className="min-h-[100vh] bg-background p-[20px] sm:p-0 sm:min-h-[80.6vh]">
        {/* ---------- HEADER ---------- */}
        <div className="w-full tems-center justify-between gap-4 fixed top-[60px] left-0 !z-10">
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
                  <Button onClick={() => (window.location.href = "/bills")}>
                    Bills
                  </Button>
                </li>
                <li>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/contact_us")}
                    className="text-primary !border-primary"
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
              className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>

            <div
              onClick={() => (window.location.href = "/")}
              className="hidden sm:block cursor-pointer"
            >
              <img
                src="images/logo.png"
                alt="Logo"
                className="w-[65px] h-[55px]"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold">Contact Us</h1>
          </div>
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <div className="max-w-6xl mx-auto space-y-10 mt-[120px] mb-5">
          <div
            className=" max-w-6xl mx-auto p-4 shadcn-card rounded-3xl border bg-cover bg-center border-card-border text-card-foreground shadow-sm"
            style={{
              backgroundImage: `linear-gradient(160deg, rgba(110, 110, 110, 0) 2.95%, rgb(172, 172, 172) 100%, rgb(172, 172, 172) 100%),url('/images/page_black.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex justify-center">
              <img
                src="/images/connect.jpg"
                alt="Lets Connect"
                className="my-2 rounded-xl w-[200px]"
              />
            </div>

            {/* TOP INFO GRID */}
            <div
              className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center bg-center p-8 rounded-xl"
              style={{
                backgroundImage: `linear-gradient(185deg, rgba(110, 110, 110, 0) 2.95%, rgb(94 54 54) 100%),url('/images/back.png')`,
              }}
            >
              {/* OFFICE */}
              <div className="flex flex-col items-center">
                <div className="h-[60px]">
                  <MapPinHouse size={48} strokeWidth={1.5} color="white" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold mb-1 text-white">OUR MAIN OFFICE</h3>
                  <p className="text-sm text-white">H No. 54, Gali No-2,</p>
                  <p className="text-sm text-white">
                    Near Nagar Nigam Prathamik Vidyalaya, Sadatpur, Karawal
                    Nagar, Delhi, 110090
                  </p>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex flex-col items-center">
                <div className="h-[60px]">
                  <Smartphone size={48} strokeWidth={1.5} color="white" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold mb-1 text-white">PHONE NUMBER</h3>
                  <p className="text-sm text-white">9868236474</p>
                  <p className="text-sm text-white">8860100079</p>
                </div>
              </div>

              {/* FAX (optional) */}
              <div className="flex flex-col items-center">
                <div className="h-[60px]">
                  <PrinterCheck size={48} strokeWidth={1.5} color="white" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold mb-1 text-white">FAX</h3>
                  <p className="text-sm text-white">Not Available</p>
                </div>
              </div>

              {/* MAIL */}
              <div className="flex flex-col items-center">
                <div className="h-[60px]">
                  <Mail size={48} strokeWidth={1.5} color="white" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold mb-1 text-white">MAIL</h3>
                  <p className="text-sm text-white">malkani.clinic@gmail.com</p>
                </div>
              </div>
            </div>

            {/* FORM + MAP SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
              {/* LEFT FORM */}
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">
                  GET A FREE CASE EVALUATION TODAY!
                </h3>
                <p className="mb-6 text-sm">AVAILABLE 24 HOURS A DAY!</p>

                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter your Name"
                    className="w-full border border-gray-300 p-3 rounded-lg"
                  />

                  <input
                    type="email"
                    placeholder="Enter a valid email address"
                    className="w-full border border-gray-300 p-3 rounded-lg"
                  />

                  <textarea
                    placeholder="Enter your message"
                    className="w-full border border-gray-300 p-3 rounded-lg h-32"
                  />

                  <Button className="px-6">Submit</Button>
                </form>
              </div>

              {/* RIGHT MAP */}
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">WE ARE HERE</h3>
                <p className="mb-4 text-sm">
                  MON-SAT 10:00AM - 9:00PM , Sunday 10:00AM - 1:00PM
                </p>

                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14018.304508574055!2d77.257!3d28.7205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfea753c85b91%3A0x2287e1d6a29d5dc6!2sMalkani%20Hospital%20of%20Electrohomeopathy%20%26%20Research%20Centre!5e0!3m2!1sen!2sin!4v1706250000000"
                  className="w-full h-72 rounded-md border-2 border-primary"
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            <img
              src="/images/connect2.png"
              alt="Lets Connect"
              className="my-2 rounded-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
