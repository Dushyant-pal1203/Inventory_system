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

  // State to track if we're generating PDF
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Format date to system date
  const formatSystemDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Update date automatically
  useEffect(() => {
    const updateDate = () => {
      setLetterData((prev) => ({
        ...prev,
        date: formatSystemDate(),
      }));
    };

    // Update on component mount
    updateDate();

    // Optional: Update date every minute to keep it current
    const intervalId = setInterval(updateDate, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("letterhead-data");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Keep system date, not saved date
      setLetterData({
        ...parsedData,
        date: formatSystemDate(),
      });
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = { ...letterData };
    localStorage.setItem("letterhead-data", JSON.stringify(dataToSave));
  }, [letterData]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    // Don't allow date field to be edited
    if (name === "date") return;

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
      setIsGeneratingPDF(true);

      // Wait for state update to take effect
      await new Promise((resolve) => setTimeout(resolve, 100));

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
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper function to render content or placeholder
  const renderContent = (content: string, placeholder: string) => {
    if (isGeneratingPDF) {
      // For PDF generation, show empty string if no content
      return content || "";
    }
    // For normal view, show placeholder if no content
    return content || placeholder;
  };

  return (
    <div className="min-h-screen p-8">
      {/* Letterhead Container */}
      <div
        ref={letterheadRef}
        className="letterhead-container w-[210mm] mx-auto shadow-2xl relative overflow-hidden"
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
        <header className="header relative bg-primary p-4 pb-0 text-white grid grid-cols-[120px_1fr] gap-8 items-center">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-pattern"></div>

          <div className="logo-container rounded-full w-36 h-36 flex items-center justify-center shadow-lg border-3 border-gold relative">
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

          <div className="header-content text-left relative">
            <h1 className="clinic-name text-xl font-bold tracking-wide mb-2 uppercase leading-tight">
              Malkani Health Of Electrohomeopathy
              <br />& Research Centre
            </h1>
            <div className="tagline text-base text-adi-100 font-medium tracking-wider mb-3 uppercase">
              Excellence in Natural Healing
            </div>
            <address className="address text-base text-white/90 not-italic leading-relaxed">
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
        <div className="sub-header bg-primary">
          <div className="contact-info flex gap-6 justify-around font-medium text-white text-sm">
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
        <main className="letter-content p-8 relative min-h-[600px] bg-white">
          {/* Letter Meta Information */}
          <div className="letter-meta mb-2 flex justify-between gap-10">
            {/* Recipient Info */}
            <div className="recipient-info border-l-3 border-primary pl-5 flex-1">
              <div className="recipient-label text-xs uppercase tracking-wider text-adi-600 font-bold mb-2">
                To
              </div>
              <div className="relative">
                <textarea
                  name="recipient"
                  value={letterData.recipient}
                  onChange={handleInputChange}
                  placeholder="Enter recipient details"
                  className="recipient-details w-full text-base text-gray-800 leading-relaxed border-none resize-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2 min-h-[120px]"
                  rows={5}
                />
                {!isGeneratingPDF && !letterData.recipient && (
                  <div className="absolute top-2 left-2 text-gray-400 pointer-events-none">
                    Enter recipient details
                  </div>
                )}
              </div>
            </div>

            {/* Letter Details */}
            <div className="letter-details text-right">
              <div className="detail-line">
                <span className="detail-label inline-block min-w-[60px] font-semibold text-primary">
                  Date:
                </span>
                <input
                  type="text"
                  name="date"
                  value={letterData.date}
                  readOnly
                  className="detail-value text-gray-800 border-none focus:outline-none bg-transparent p-1 w-48"
                />
              </div>
              <div className="detail-line">
                <span className="detail-label inline-block min-w-[60px] font-semibold text-primary">
                  Ref:
                </span>
                <div>
                  <input
                    type="text"
                    name="ref"
                    value={letterData.ref}
                    onChange={handleInputChange}
                    placeholder=""
                    className="detail-value text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-primary focus:bg-adi-50 rounded p-1 w-48"
                  />
                  {!isGeneratingPDF && !letterData.ref && (
                    <div className="absolute top-1 left-1 text-gray-400 pointer-events-none">
                      Reference number
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subject Line */}
          <div className="subject-line my-6 py-4 border-b-2 border-primary">
            <div className="subject-label font-bold text-adi-800 text-sm uppercase tracking-wider">
              Subject
            </div>
            <div className="relative">
              <input
                type="text"
                name="subject"
                value={letterData.subject}
                onChange={handleInputChange}
                placeholder=""
                className="subject-text text-xl font-semibold text-gray-800 mt-2 w-full border-none focus:outline-none focus:ring-2 focus:ring-primary focus:bg-adi-50 rounded p-2"
              />
              {!isGeneratingPDF && !letterData.subject && (
                <div className="absolute top-3 left-2 text-gray-400 pointer-events-none">
                  Enter subject
                </div>
              )}
            </div>
          </div>

          {/* Salutation */}
          <div className="salutation mb-6">
            <input
              type="text"
              name="salutation"
              value={letterData.salutation}
              onChange={handleInputChange}
              className="w-full text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-primary focus:bg-adi-50 rounded p-2"
            />
          </div>

          {/* Letter Body */}
          <div className="letter-body mb-10 min-h-[300px]">
            <div className="relative">
              <textarea
                name="letterBody"
                value={letterData.letterBody}
                onChange={handleInputChange}
                placeholder="Type your letter here..."
                className="w-full h-[400px] text-gray-700 leading-relaxed border-none resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:bg-adi-50 rounded p-3 text-justify"
                rows={15}
              />
              {!isGeneratingPDF && !letterData.letterBody && (
                <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                  Type your letter here...
                </div>
              )}
            </div>
          </div>

          {/* Closing Section */}
          <div className="letter-closing mt-10 max-w-[300px]">
            <div className="closing-text mb-4">
              <input
                type="text"
                name="closing"
                value={letterData.closing}
                onChange={handleInputChange}
                className="w-full border-none focus:outline-none focus:ring-2 focus:ring-adi-300 focus:bg-adi-50 rounded p-2"
              />
            </div>
            <div className="signature-space h-16 border-b border-primary mb-4 relative">
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
          <div className="footer-content flex justify-between items-center gap-5 mb-4">
            <div className="footer-brand text-left">
              <div className="footer-brand-name font-bold text-lg mb-1 text-adi-100">
                MALKANI HEALTH
              </div>
              <div className="footer-tagline text-sm text-white/70">
                Electrohomeopathy & Research Centre
              </div>
            </div>
            <div className="footer-contacts flex gap-4 text-sm">
              <div className="footer-contact-item flex items-center gap-2">
                📧 malkani.clinic@gmail.com
              </div>
              <div className="footer-contact-item flex items-center gap-2">
                📱 +91-9838236474
              </div>
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
      <div className="actions fixed bottom-8 right-8 flex gap-3 z-50">
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
