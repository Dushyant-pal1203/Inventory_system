import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { MapPinHouse, Mail, PrinterCheck, Smartphone } from "lucide-react";

// Simple client-side validators
const validateEmail = (email: string) => {
  // basic RFC-ish check
  return /^\S+@\S+\.\S+$/.test(email);
};
const validatePhone = (phone: string) => {
  // allow + and digits and spaces/dashes, require at least 7 digits
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 7;
};

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [loading, setLoading] = useState(false);

  const resetStatus = () => {
    setStatusMessage("");
    setStatusType("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetStatus();

    if (!name.trim()) {
      setStatusType("error");
      setStatusMessage("Please enter your name.");
      return;
    }
    if (!validateEmail(email)) {
      setStatusType("error");
      setStatusMessage("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(phone)) {
      setStatusType("error");
      setStatusMessage(
        "Please enter a valid phone number (at least 7 digits)."
      );
      return;
    }
    if (message.trim().length < 5) {
      setStatusType("error");
      setStatusMessage("Please enter a short message (at least 5 characters).");
      return;
    }

    // Prepare data for FormSubmit AJAX endpoint
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("message", message);
      formData.append("_subject", "New Contact Form Submission!");
      formData.append("_template", "table");
      formData.append("_captcha", "false");

      const response = await fetch(
        "https://formsubmit.co/ajax/yam.raj32742@gmail.com",
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatusType("success");
        setStatusMessage(
          "Message sent successfully. We'll get back to you soon!"
        );
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setStatusType("error");
        setStatusMessage(
          data.message || "Something went wrong while sending the message."
        );
      }
    } catch (err) {
      setStatusType("error");
      setStatusMessage("Network error — please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-[100vh] bg-[#00000033] p-[20px] sm:p-0 sm:min-h-[80.6vh]">
        {/* ---------- HEADER ---------- */}
        <Navbar active="contact" title="Contact Us" />

        {/* ---------- MAIN CONTENT ---------- */}
        <div className="max-w-6xl mx-auto space-y-10 pt-10 sm:pt-[125px] pb-0 sm:pb-5">
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
                  <p className="text-sm text-white">+91 9868236474</p>
                  <p className="text-sm text-white">+91 8860100079</p>
                </div>
              </div>

              {/* FAX */}
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
                  <a
                    href="mailto:malkani.clinic@gmail.com"
                    className="text-sm text-white hover:underline"
                  >
                    malkani.clinic@gmail.com
                  </a>
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

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {statusMessage && (
                    <div
                      role="status"
                      className={`p-3 rounded-md text-sm mb-2 ${
                        statusType === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {statusMessage}
                    </div>
                  )}

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg text-gray-700"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter a valid email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg text-gray-700"
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter a valid phone number "
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg text-gray-700"
                  />

                  <textarea
                    name="message"
                    placeholder="Enter your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg text-gray-700 h-[83px]"
                  ></textarea>

                  <Button type="submit" className="px-6" disabled={loading}>
                    {loading ? "Sending..." : "Submit"}
                  </Button>
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
