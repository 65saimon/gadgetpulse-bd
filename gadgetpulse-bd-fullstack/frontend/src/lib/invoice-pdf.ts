import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice } from '../types';

export const generateInvoicePDF = (invoice: Invoice, storeInfo?: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const storeName = storeInfo?.name || 'GadgetPulse Bangladesh';
  const storeAddress = storeInfo?.address || 'Level 4, Block D, Jamuna Future Park, Kuril, Dhaka 1229';
  const storePhone = storeInfo?.phone || '+880 1819-285538';
  const storeEmail = storeInfo?.email || 'support@gadgetpulse.bd';

  // Top Accent Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(storeName, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Premier Destination for Genuine Smartphones & Smart Gadgets', 14, 25);
  doc.text(`${storeAddress} | Helpline: ${storePhone} | Email: ${storeEmail}`, 14, 30);

  // Invoice Title Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('TAX INVOICE', pageWidth - 14, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - 14, 25, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString('en-GB')}`, pageWidth - 14, 30, { align: 'right' });
  if (invoice.order?.orderNumber) {
    doc.text(`Order ID: ${invoice.order.orderNumber}`, pageWidth - 14, 35, { align: 'right' });
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 40, pageWidth - 14, 40);

  // Customer & Bill To Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, pageWidth - 28, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('BILL TO / RECIPIENT:', 18, 51);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Customer Name: ${invoice.customerName}`, 18, 57);
  doc.text(`Phone: ${invoice.customerPhone}`, 18, 62);
  doc.text(`Delivery Address: ${invoice.customerAddress}`, pageWidth / 2, 57);
  doc.text(`Payment: ${invoice.paymentMethod.replace(/_/g, ' ')} (${invoice.paymentStatus})`, pageWidth / 2, 62);

  // Items Table
  const tableRows = (invoice.order?.items || []).map((item, idx) => [
    idx + 1,
    item.variantName && item.variantName !== 'Standard'
      ? `${item.productName} (${item.variantName})`
      : item.productName,
    item.sku,
    `BDT ${Math.round(item.unitPrice).toLocaleString('en-BD')}`,
    item.quantity,
    `BDT ${Math.round(item.totalPrice).toLocaleString('en-BD')}`,
  ]);

  // If no items attached in snapshot, add placeholder line
  if (tableRows.length === 0) {
    tableRows.push([1, 'Mobile Phone / Electronic Gadget', 'GP-ITEM-01', `BDT ${Math.round(invoice.subtotal).toLocaleString('en-BD')}`, 1, `BDT ${Math.round(invoice.subtotal).toLocaleString('en-BD')}`]);
  }

  (doc as any).autoTable({
    startY: 74,
    head: [['#', 'Description / Item Details', 'SKU', 'Unit Price', 'Qty', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 80 },
      2: { cellWidth: 30 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'right', cellWidth: 26 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Calculation Block on Right
  const startCalcX = pageWidth - 80;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal:', startCalcX, finalY);
  doc.text(`BDT ${Math.round(invoice.subtotal).toLocaleString('en-BD')}`, pageWidth - 14, finalY, { align: 'right' });

  if (invoice.discount > 0) {
    doc.text('Discount:', startCalcX, finalY + 5);
    doc.text(`- BDT ${Math.round(invoice.discount).toLocaleString('en-BD')}`, pageWidth - 14, finalY + 5, { align: 'right' });
  }

  doc.text('VAT / Tax (5%):', startCalcX, finalY + 10);
  doc.text(`BDT ${Math.round(invoice.vat).toLocaleString('en-BD')}`, pageWidth - 14, finalY + 10, { align: 'right' });

  doc.text('Delivery Charge:', startCalcX, finalY + 15);
  doc.text(`BDT ${Math.round(invoice.deliveryFee).toLocaleString('en-BD')}`, pageWidth - 14, finalY + 15, { align: 'right' });

  // Grand Total Highlight
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(startCalcX - 4, finalY + 20, 70, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total:', startCalcX, finalY + 26);
  doc.text(`BDT ${Math.round(invoice.grandTotal).toLocaleString('en-BD')}`, pageWidth - 16, finalY + 26, { align: 'right' });

  // Terms and Official Warranty Note
  const termsY = finalY + 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Terms & Warranty Conditions:', 14, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    invoice.terms ||
      '1. Official Brand Warranty is serviceable at authorized warranty centers across Bangladesh.\n2. Please preserve this computer-generated tax invoice and the original product packaging for warranty claims.\n3. Physical, water, or electrical spike damage is not covered under standard manufacturer warranty.',
    14,
    termsY + 5
  );

  // Footer Computer Generated Seal
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an authenticated computer-generated invoice. No physical signature is required.', 14, 285);
  doc.text(`Generated on ${new Date().toLocaleString('en-GB')}`, pageWidth - 14, 285, { align: 'right' });

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
};
