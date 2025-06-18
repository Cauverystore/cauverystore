import { jsPDF } from "jspdf";

export const generateInvoicePDF = ({
  orderId,
  productName,
  quantity,
  totalPrice,
  createdAt,
}: {
  orderId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Cauvery Store", 20, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("www.cauverystore.in", 20, 26);
  doc.text("support@cauverystore.in", 20, 32);

  // Divider line
  doc.line(20, 38, 190, 38);

  // Invoice Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice", 20, 48);

  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${orderId}`, 20, 58);
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, 20, 66);

  // Product Table
  doc.setFont("helvetica", "bold");
  doc.text("Product", 20, 80);
  doc.text("Qty", 140, 80);
  doc.text("Price", 170, 80);

  doc.setFont("helvetica", "normal");
  doc.text(productName, 20, 90);
  doc.text(quantity.toString(), 140, 90);
  doc.text(`₹${totalPrice.toFixed(2)}`, 170, 90);

  // Total
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ₹${totalPrice.toFixed(2)}`, 150, 110);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Thank you for shopping with us!", 20, 130);

  // Save file
  doc.save(`invoice-${orderId}.pdf`);
};
