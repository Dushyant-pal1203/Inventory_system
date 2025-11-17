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

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const primaryGreen = [34, 139, 34];
  const darkGreen = [20, 80, 20];
  const lightGray = [240, 240, 240];
  const black = [0, 0, 0];

  doc.setFillColor(...primaryGreen);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const title = "MALKANI HEALTH OF ELECTROHOMEOPATHY";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 15);

  doc.setFontSize(14);
  const subtitle = "& RESEARCH CENTRE";
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 23);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const address = "(64, Street No. 2, Vill- Sadipur Delhi 110094.)";
  const addressWidth = doc.getTextWidth(address);
  doc.text(address, (pageWidth - addressWidth) / 2, 31);

  doc.setFontSize(8);
  const gstin = "GSTIN: _______________";
  const gstinWidth = doc.getTextWidth(gstin);
  doc.text(gstin, (pageWidth - gstinWidth) / 2, 38);

  yPosition = 55;

  doc.setTextColor(...black);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const invoiceTitle = "INVOICE";
  const invoiceTitleWidth = doc.getTextWidth(invoiceTitle);
  doc.text(invoiceTitle, (pageWidth - invoiceTitleWidth) / 2, yPosition);

  yPosition += 15;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 20, yPosition);

  doc.setFontSize(10);
  doc.text("Bill No:", pageWidth - 80, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.billNumber, pageWidth - 45, yPosition);

  yPosition += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.clientName, 20, yPosition);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Issue Date:", pageWidth - 80, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(data.issueDate, pageWidth - 45, yPosition);

  yPosition += 6;
  const addressLines = doc.splitTextToSize(data.clientAddress, 70);
  doc.text(addressLines, 20, yPosition);

  yPosition += 6 * addressLines.length;
  doc.text(data.clientPhone, 20, yPosition);

  yPosition += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total Amount Due:", pageWidth - 80, yPosition);
  doc.setTextColor(...primaryGreen);
  doc.text(`Rs. ${data.totalDue.toFixed(2)}`, pageWidth - 45, yPosition);
  doc.setTextColor(...black);

  yPosition += 12;

  doc.setFillColor(...primaryGreen);
  doc.rect(15, yPosition, pageWidth - 30, 8, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", 20, yPosition + 5.5);
  doc.text("Quantity", pageWidth / 2 - 15, yPosition + 5.5);
  doc.text("Rate(Rs.)", pageWidth / 2 + 25, yPosition + 5.5);
  doc.text("Amount", pageWidth - 30, yPosition + 5.5, { align: "right" });

  yPosition += 8;
  doc.setTextColor(...black);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let rowColor = true;
  data.items.forEach((item, index) => {
    if (rowColor) {
      doc.setFillColor(...lightGray);
      doc.rect(15, yPosition, pageWidth - 30, 7, "F");
    }

    doc.text(item.medicineName, 20, yPosition + 5);
    doc.text(item.quantity.toString(), pageWidth / 2 - 15, yPosition + 5);
    doc.text(`Rs. ${item.rate.toFixed(2)}`, pageWidth / 2 + 25, yPosition + 5);
    doc.text(`Rs. ${item.amount.toFixed(2)}`, pageWidth - 30, yPosition + 5, { align: "right" });

    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPosition + 7, pageWidth - 15, yPosition + 7);

    yPosition += 7;
    rowColor = !rowColor;

    if (yPosition > pageHeight - 80 && index < data.items.length - 1) {
      doc.addPage();
      yPosition = 20;
      rowColor = true;
    }
  });

  yPosition += 8;

  const summaryX = pageWidth - 70;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Sub Total", summaryX, yPosition);
  doc.text(`Rs. ${data.subtotal.toFixed(2)}`, pageWidth - 30, yPosition, { align: "right" });

  yPosition += 6;
  doc.text(`Tax ${data.taxPercentage}%`, summaryX, yPosition);
  doc.text(`Rs. ${data.taxAmount.toFixed(2)}`, pageWidth - 30, yPosition, { align: "right" });

  yPosition += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Due", summaryX, yPosition);
  doc.setTextColor(...primaryGreen);
  doc.text(`Rs. ${data.totalDue.toFixed(2)}`, pageWidth - 30, yPosition, { align: "right" });
  doc.setTextColor(...black);

  yPosition += 12;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Our Payment Methods:", 20, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Bank, BHIM #, PhonePe, Google Pay, NetBanking", 20, yPosition);

  yPosition += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("NOTES:", 20, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Goods once sold will not be returned.", 20, yPosition);
  yPosition += 4;
  doc.text("All disputes shall be subject to Delhi jurisdiction", 20, yPosition);
  yPosition += 4;
  doc.text("Please feel free to contact us in case of any question you may have!", 20, yPosition);

  yPosition += 12;
  doc.setFontSize(8);
  doc.text("Thank you for your time & business!", 20, yPosition);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Dr. Suresh Malkani", pageWidth - 50, yPosition);
  yPosition += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Authorized Signer", pageWidth - 50, yPosition);

  const footerY = pageHeight - 15;
  doc.setFillColor(...primaryGreen);
  doc.rect(0, footerY, pageWidth, 15, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const contactInfo = "malkani.clinic@gmail.com | +91-9839239874 | +91-8800100378 | www.electrohomeopathy.in";
  const contactWidth = doc.getTextWidth(contactInfo);
  doc.text(contactInfo, (pageWidth - contactWidth) / 2, footerY + 9);

  doc.save(`Invoice_${data.billNumber}.pdf`);
}
