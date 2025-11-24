import jsPDF from "jspdf";
import { type CartItem } from "@shared/schema";

interface InvoiceData {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  items: CartItem[];
  billNumber: string;
  issueDate: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  totalDue: number;
}

// Helper function to load logo
async function getLogoBase64(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
    img.src = "/images/logo.png";
  });
}

export async function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Colors
  const primaryGreen: [number, number, number] = [34, 139, 34];
  const lightGray: [number, number, number] = [240, 240, 240];
  const black: [number, number, number] = [0, 0, 0];
  const grayText: [number, number, number] = [200, 200, 200];
  const white: [number, number, number] = [255, 255, 255]; // FIX ADDED

  // Load logo
  const logoBase64 = await getLogoBase64();

  // Header box
  doc.setFillColor(...primaryGreen);
  doc.roundedRect(0, 0, pageWidth, 40, 0, 0, "F");

  // Add logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", 3, 2, 35, 30);
    } catch {
      console.log("Logo could not be added");
    }
  }

  // Header text
  doc.setTextColor(...white); // FIXED
  doc.setFontSize(19);
  doc.setFont("helvetica", "bold");
  doc.text("MALKANI HEALTH OF ELECTROHOMEOPATHY &", 45, 10);
  doc.text("RESEARCH CENTRE", 45, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("(64, Street No. 2, Vill- Sadipur Delhi 110094.)", 45, 26);

  doc.setFontSize(8);
  doc.text("GSTIN:", 45, 30);
  doc.setFont("helvetica", "bold");
  doc.text("07AHCPM0625Q1Z5", 55, 30);

  // Watermark
  if (logoBase64) {
    try {
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
      doc.addImage(
        logoBase64,
        "PNG",
        (pageWidth - 80) / 2,
        (pageHeight - 80) / 2,
        80,
        70
      );
      doc.restoreGraphicsState();
    } catch {
      console.log("Watermark could not be added");
    }
  }

  // Invoice Title
  yPosition = 55;
  doc.setTextColor(...black);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const title = "INVOICE";
  doc.text(title, pageWidth / 2, yPosition, { align: "center" });

  // BILL TO SECTION
  yPosition += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILL TO:", 20, yPosition);

  doc.text("Bill No:", pageWidth - 80, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.billNumber, pageWidth - 45, yPosition);

  yPosition += 6;
  doc.text(data.clientName, 20, yPosition);

  doc.setFont("helvetica", "bold");
  doc.text("Issue Date:", pageWidth - 80, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.issueDate, pageWidth - 45, yPosition);

  yPosition += 6;
  const addrLines = doc.splitTextToSize(data.clientAddress, 70);
  doc.text(addrLines, 20, yPosition);

  yPosition += addrLines.length * 6;
  doc.text(data.clientPhone, 20, yPosition);

  // TOTAL DUE
  yPosition += 2;
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount Due:", pageWidth - 80, yPosition);
  doc.setTextColor(...primaryGreen);
  doc.text(`Rs. ${data.totalDue.toFixed(2)}`, pageWidth - 28, yPosition, {
    align: "right",
  });
  doc.setTextColor(...black);

  // TABLE HEADER
  yPosition += 12;
  doc.setFillColor(...primaryGreen);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...white);
  doc.text("Description", 20, yPosition + 5.5);
  doc.text("Quantity", pageWidth / 2 - 15, yPosition + 5.5);
  doc.text("Rate (Rs.)", pageWidth / 2 + 25, yPosition + 5.5);
  doc.text("Amount", pageWidth - 30, yPosition + 5.5, { align: "right" });

  // ITEMS
  yPosition += 8;
  doc.setTextColor(...black);
  doc.setFont("helvetica", "normal");

  let rowColor = true;

  data.items.forEach((item, index) => {
    if (rowColor) {
      doc.setFillColor(...lightGray);
      doc.rect(15, yPosition, pageWidth - 30, 7, "F");
    }

    doc.text(item.medicineName, 20, yPosition + 5);
    doc.text(item.quantity.toString(), pageWidth / 2 - 15, yPosition + 5);
    doc.text(`Rs. ${item.rate.toFixed(2)}`, pageWidth / 2 + 25, yPosition + 5);
    doc.text(`Rs. ${item.amount.toFixed(2)}`, pageWidth - 30, yPosition + 5, {
      align: "right",
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition + 7, pageWidth - 15, yPosition + 7);

    yPosition += 7;
    rowColor = !rowColor;

    // NEW PAGE IF NEEDED
    if (yPosition > pageHeight - 80 && index < data.items.length - 1) {
      doc.addPage();
      yPosition = 20;
      rowColor = true;
    }
  });

  // SUMMARY
  yPosition += 10;
  const summaryX = pageWidth - 70;

  doc.text("Sub Total", summaryX, yPosition);
  doc.text(`Rs. ${data.subtotal.toFixed(2)}`, pageWidth - 30, yPosition, {
    align: "right",
  });

  yPosition += 6;
  doc.text(`Tax ${data.taxPercentage}%`, summaryX, yPosition);
  doc.text(`Rs. ${data.taxAmount.toFixed(2)}`, pageWidth - 30, yPosition, {
    align: "right",
  });

  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total Due", summaryX, yPosition);
  doc.setTextColor(...primaryGreen);
  doc.text(`Rs. ${data.totalDue.toFixed(2)}`, pageWidth - 30, yPosition, {
    align: "right",
  });
  doc.setTextColor(...black);

  // Notes
  yPosition += 100;
  doc.setFont("helvetica", "bold");
  doc.text("Our Payment Methods:", 20, yPosition);

  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Bank, BHIM #, PhonePe, Google Pay, NetBanking", 20, yPosition);

  // Notes section
  yPosition += 10;
  doc.setFont("helvetica", "bold");
  doc.text("NOTES:", 20, yPosition);
  yPosition += 5;

  doc.setFont("helvetica", "normal");
  doc.text("Goods once sold will not be returned.", 20, yPosition);
  yPosition += 4;
  doc.text(
    "All disputes shall be subject to Delhi jurisdiction",
    20,
    yPosition
  );
  yPosition += 4;
  doc.text(
    "Please feel free to contact us in case of any question you may have!",
    20,
    yPosition
  );
  // Thank you and signature section

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("Dr. Suresh Malkani", pageWidth - 55, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text("Authorized Signer", pageWidth - 55, yPosition);
  yPosition += 4;
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your time & business!", pageWidth / 2, yPosition, {
    align: "center",
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setFillColor(...primaryGreen);
  doc.rect(0, footerY, pageWidth, 15, "F");

  doc.setTextColor(...white);
  doc.setFontSize(8);
  const contact =
    "malkani.clinic@gmail.com | +91-9839239874 | +91-8800100378 | www.electrohomeopathy.in";
  doc.text(contact, pageWidth / 2, footerY + 9, { align: "center" });

  doc.save(`Invoice_${data.billNumber}.pdf`);
}
