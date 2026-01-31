import React, { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./LetterHead.css";

// Define types for form data
interface LetterData {
  recipient: string;
  date: string;
  ref: string;
  subject: string;
  salutation: string;
  letterBody: string;
  closing: string;
  signatoryName: string;
  signatoryTitle: string;
}

const LetterHead: React.FC = () => {
  // Refs
  const letterheadRef = useRef<HTMLDivElement>(null);

  // State for form data
  const [letterData, setLetterData] = useState<LetterData>({
    recipient: "",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    ref: "",
    subject: "",
    salutation: "Dear ______,",
    letterBody: "",
    closing: "Yours sincerely,",
    signatoryName: "Dr. Suresh Malkani",
    signatoryTitle: "Chief Medical Officer & Founder",
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("letterhead-data");
    if (savedData) {
      setLetterData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("letterhead-data", JSON.stringify(letterData));
  }, [letterData]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setLetterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!letterheadRef.current) return;

    try {
      const canvas = await html2canvas(letterheadRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Malkani-Health-Letter.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 md:p-8 pt-28">
      {/* Letterhead Container */}
      <div
        ref={letterheadRef}
        className="letterhead-container max-w-[210mm] mx-auto  shadow-2xl relative overflow-hidden"
      >
        {/* Watermark */}
        <div className="watermark absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="images/logo.png"
            alt="Watermark"
            className="w-[800px] opacity-5 grayscale"
            onError={(e) => {
              // Fallback if logo doesn't exist
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Header */}
        <header className="header relative bg-primary p-6 text-white grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 md:gap-8 items-center">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-pattern"></div>

          <div className="logo-container rounded-full w-32 h-32 md:w-36 md:h-36 flex items-center justify-center shadow-lg border-3 border-gold relative  mx-auto md:mx-0">
            <img
              src="images/logo.png"
              alt="Malkani Health Logo"
              className="w-28 h-auto"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                // Show fallback text
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<span class="text-adi-800 font-bold text-lg">M</span>';
                }
              }}
            />
          </div>

          <div className="header-content text-center md:text-left relative ">
            <h1 className="clinic-name text-lg md:text-xl font-bold tracking-wide mb-2 uppercase leading-tight">
              Malkani Health Of Electrohomeopathy
              <br />& Research Centre
            </h1>
            <div className="tagline text-sm md:text-base text-adi-100 font-medium tracking-wider mb-3 uppercase">
              Excellence in Natural Healing
            </div>
            <address className="address text-sm md:text-base text-white/90 not-italic leading-relaxed">
              54, Street No. 2, Vill. Sadatpur, Delhi 110094
            </address>
          </div>
        </header>

        <div className="letterhead-divider bg-primary">
          <div className="divider-line"></div>
          <div className="divider-icon">⚕️</div>
          <div className="divider-line"></div>
        </div>
        {/* Sub Header */}
        <div className="sub-header bg-primary to-white p-3 md:p-4 ">
          <div className="contact-info flex flex-col md:flex-row gap-3 md:gap-6 justify-center md:justify-around text-sm md:text-base font-semibold text-adi-800">
            <span className="contact-item flex items-center gap-2">
              <span className="text-gold">•</span> +91-9838236474
            </span>
            <span className="contact-item flex items-center gap-2">
              <span className="text-gold">•</span> +91-8860100079
            </span>
            <span className="contact-item flex items-center gap-2">
              <span className="text-gold">•</span> malkani.clinic@gmail.com
            </span>
          </div>
        </div>

        {/* Letter Content */}
        <main className="letter-content p-6 md:p-8 relative  min-h-[600px] bg-white">
          {/* Letter Meta Information */}
          <div className="letter-meta mb-2 flex justify-between gap-6 md:gap-10">
            {/* Recipient Info */}
            <div className="recipient-info border-l-3 border-adi-400 pl-5">
              <div className="recipient-label text-xs uppercase tracking-wider text-adi-600 font-bold mb-2">
                To
              </div>
              <textarea
                name="recipient"
                value={letterData.recipient}
                onChange={handleInputChange}
                placeholder="Enter recipient details"
                className="recipient-details w-full text-sm md:text-base text-gray-800 leading-relaxed border-none resize-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2 min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Letter Details */}
            <div className="letter-details text-left md:text-right">
              <div className="detail-line mb-3">
                <span className="detail-label inline-block min-w-[60px] font-semibold text-adi-700">
                  Date:
                </span>
                <input
                  type="text"
                  name="date"
                  value={letterData.date}
                  onChange={handleInputChange}
                  className="detail-value text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-1 w-full md:w-auto"
                />
              </div>
              <div className="detail-line">
                <span className="detail-label inline-block min-w-[60px] font-semibold text-adi-700">
                  Ref:
                </span>
                <input
                  type="text"
                  name="ref"
                  value={letterData.ref}
                  onChange={handleInputChange}
                  placeholder="Reference number"
                  className="detail-value text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-1 w-full md:w-auto"
                />
              </div>
            </div>
          </div>

          {/* Subject Line */}
          <div className="subject-line my-10 py-4 border-b-2 border-adi-100">
            <div className="subject-label font-bold text-adi-800 text-sm uppercase tracking-wider">
              Subject
            </div>
            <input
              type="text"
              name="subject"
              value={letterData.subject}
              onChange={handleInputChange}
              placeholder="Enter subject"
              className="subject-text text-lg md:text-xl font-semibold text-gray-800 mt-2 w-full border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2"
            />
          </div>

          {/* Salutation */}
          <div className="salutation mb-6">
            <input
              type="text"
              name="salutation"
              value={letterData.salutation}
              onChange={handleInputChange}
              className="w-full md:w-auto text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2"
            />
          </div>

          {/* Letter Body */}
          <div className="letter-body mb-10 min-h-[300px]">
            <textarea
              name="letterBody"
              value={letterData.letterBody}
              onChange={handleInputChange}
              placeholder="Type your letter here..."
              className="w-full h-[300px] md:h-[400px] text-gray-700 leading-relaxed border-none resize-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-3 text-justify"
              rows={15}
            />
          </div>

          {/* Closing Section */}
          <div className="letter-closing mt-12 max-w-[300px]">
            <div className="closing-text mb-4">
              <input
                type="text"
                name="closing"
                value={letterData.closing}
                onChange={handleInputChange}
                className="w-full border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2"
              />
            </div>
            <div className="signature-space h-16 border-b border-gray-300 mb-4 relative">
              <span className="absolute bottom-[-25px] left-0 text-xs text-gray-500 italic">
                Signature
              </span>
            </div>
            <div className="signatory-name font-bold text-adi-800 text-lg mt-8">
              <input
                type="text"
                name="signatoryName"
                value={letterData.signatoryName}
                onChange={handleInputChange}
                className="w-full border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2"
              />
            </div>
            <div className="signatory-title text-gray-600 text-sm italic">
              <input
                type="text"
                name="signatoryTitle"
                value={letterData.signatoryTitle}
                onChange={handleInputChange}
                className="w-full border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2"
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer bg-primary text-white p-5 text-center border-t-4 border-gold">
          <div className="footer-content flex flex-col md:flex-row justify-between items-center gap-5 mb-4">
            <div className="footer-brand text-center md:text-left">
              <div className="footer-brand-name font-bold text-lg mb-1 text-adi-100">
                MALKANI HEALTH
              </div>
              <div className="footer-tagline text-sm text-white/70">
                Electrohomeopathy & Research Centre
              </div>
            </div>
            <div className="footer-contacts flex flex-col md:flex-row gap-4 text-sm">
              <div className="footer-contact-item flex items-center gap-2">
                📧 malkani.clinic@gmail.com
              </div>
              <div className="footer-contact-item flex items-center gap-2">
                📱 +91-9838236474
              </div>
              {/* <div className="footer-contact-item flex items-center gap-2">
                🌐 www.electrohomeopathy.in
              </div> */}
            </div>
          </div>
          <div className="footer-divider w-full h-px bg-white/20 my-4"></div>
          <div className="footer-copyright text-xs text-white/60">
            This document is confidential and intended solely for the addressee.
            | 54, Street No. 2, Vill. Sadatpur, Delhi 110094
          </div>
        </footer>
      </div>

      {/* Action Buttons */}
      <div className="actions fixed bottom-8 right-8 flex flex-col md:flex-row gap-3 z-50">
        <button
          onClick={handlePrint}
          className="btn-secondary bg-white text-blue-700 border-2 border-blue-500 px-5 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-50 transition-all duration-300 flex items-center gap-2"
        >
          🖨️ Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="btn-primary bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
};

export default LetterHead;

