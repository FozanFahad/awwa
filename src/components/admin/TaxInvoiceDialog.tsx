import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { companySettings } from '@/config/companySettings';
import companyLogo from '@/assets/company-logo.jpg';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface InvoiceData {
  id: string;
  invoice_no: string;
  issued_at: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  seller_vat_number: string | null;
  buyer_vat_number: string | null;
  zatca_qr_code: string | null;
  reservation: {
    confirmation_code: string;
    start_date: string;
    end_date: string;
    nights: number;
    guest: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
    unit: {
      name_en: string;
      name_ar: string;
      property: {
        name_en: string;
        name_ar: string;
        address: string | null;
        address_ar: string | null;
      } | null;
    } | null;
  } | null;
}

interface TaxInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string | null;
  existingInvoiceId?: string | null;
}

// ZATCA QR Code Generator (TLV Format)
function generateZatcaQR(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  total: number,
  vatAmount: number
): string {
  const tlvEncode = (tag: number, value: string): Uint8Array => {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(value);
    const result = new Uint8Array(2 + valueBytes.length);
    result[0] = tag;
    result[1] = valueBytes.length;
    result.set(valueBytes, 2);
    return result;
  };

  const parts = [
    tlvEncode(1, sellerName),
    tlvEncode(2, vatNumber),
    tlvEncode(3, timestamp),
    tlvEncode(4, total.toFixed(2)),
    tlvEncode(5, vatAmount.toFixed(2)),
  ];

  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }

  // Convert to base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

export function TaxInvoiceDialog({ open, onOpenChange, reservationId, existingInvoiceId }: TaxInvoiceDialogProps) {
  const { language } = useLanguage();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Company info from settings
  const companyInfo = {
    name_en: companySettings.establishment_name_en,
    name_ar: companySettings.establishment_name_ar,
    vat_number: companySettings.vat_number,
    address_en: companySettings.address_en,
    address_ar: companySettings.address_ar,
    cr_number: companySettings.cr_number,
  };

  useEffect(() => {
    if (open && reservationId) {
      if (existingInvoiceId) {
        fetchExistingInvoice(existingInvoiceId);
      } else {
        generateNewInvoice(reservationId);
      }
    }
  }, [open, reservationId, existingInvoiceId]);

  const fetchExistingInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          reservation:reservations(
            confirmation_code,
            start_date,
            end_date,
            nights,
            guest:guests(full_name, phone, email),
            unit:units(
              name_en,
              name_ar,
              property:properties(name_en, name_ar, address, address_ar)
            )
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      setInvoice(data as InvoiceData);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInvoice = async (resId: string) => {
    setGenerating(true);
    try {
      // First get reservation details
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .select(`
          id,
          confirmation_code,
          start_date,
          end_date,
          nights,
          total_amount,
          taxes_amount,
          guest:guests(full_name, phone, email),
          unit:units(
            name_en,
            name_ar,
            property:properties(name_en, name_ar, address, address_ar)
          )
        `)
        .eq('id', resId)
        .single();

      if (resError) throw resError;

      const subtotal = Number(reservation.total_amount) - Number(reservation.taxes_amount || 0);
      const taxAmount = Number(reservation.taxes_amount) || subtotal * 0.15;
      const totalAmount = subtotal + taxAmount;

      // Generate ZATCA QR Code
      const timestamp = new Date().toISOString();
      const qrCode = generateZatcaQR(
        companyInfo.name_en,
        companyInfo.vat_number,
        timestamp,
        totalAmount,
        taxAmount
      );

      // Create invoice in database
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          reservation_id: resId,
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          seller_vat_number: companyInfo.vat_number,
          zatca_qr_code: qrCode,
          invoice_type: 'standard',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Fetch complete invoice with relations
      await fetchExistingInvoice(newInvoice.id);
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <title>Tax Invoice - ${invoice?.invoice_no}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .invoice { border: 2px solid #333; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .invoice-title { font-size: 18px; margin-top: 10px; background: #f0f0f0; padding: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .info-box { padding: 10px; background: #f9f9f9; border-radius: 4px; }
            .info-box h3 { font-size: 14px; margin-bottom: 8px; color: #666; }
            .info-box p { font-size: 13px; margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: ${language === 'ar' ? 'right' : 'left'}; }
            th { background: #f0f0f0; }
            .totals { margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .totals-row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; border-bottom: none; padding-top: 15px; }
            .qr-section { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ccc; }
            .qr-code { width: 150px; height: 150px; margin: 10px auto; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            @media print { body { padding: 0; } .invoice { border: none; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            companyInfo: {
              name_en: companyInfo.name_en,
              name_ar: companyInfo.name_ar,
              vat_number: companyInfo.vat_number,
              address_en: companyInfo.address_en,
              address_ar: companyInfo.address_ar,
              cr_number: companyInfo.cr_number,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const htmlContent = await response.text();
      
      // Open in new window for printing/saving as PDF
      const pdfWindow = window.open('', '_blank');
      if (pdfWindow) {
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
        pdfWindow.focus();
        // Trigger print dialog which allows saving as PDF
        setTimeout(() => {
          pdfWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy', { 
      locale: language === 'ar' ? ar : enUS 
    });
  };

  const formatDateTime = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm:ss', { 
      locale: language === 'ar' ? ar : enUS 
    });
  };

  if (loading || generating) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ms-3">
              {generating 
                ? (language === 'ar' ? 'جاري إنشاء الفاتورة...' : 'Generating invoice...')
                : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            {language === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice'}
            <span className="text-sm font-normal text-muted-foreground">
              {invoice.invoice_no}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 me-1" />
              {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 me-1" />
              {language === 'ar' ? 'طباعة' : 'Print'}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Invoice Content for Print */}
        <div ref={printRef} className="bg-background p-6 border rounded-lg">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-foreground">
            <img 
              src={companyLogo} 
              alt={language === 'ar' ? companyInfo.name_ar : companyInfo.name_en}
              className="h-20 mx-auto mb-3 object-contain"
            />
            <h1 className="text-2xl font-bold">
              {language === 'ar' ? companyInfo.name_ar : companyInfo.name_en}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' ? companyInfo.address_ar : companyInfo.address_en}
            </p>
            <p className="text-sm mt-1">
              {language === 'ar' ? 'الرقم الضريبي' : 'VAT No.'}: {companyInfo.vat_number}
            </p>
            {companyInfo.cr_number && (
              <p className="text-sm">
                {language === 'ar' ? 'السجل التجاري' : 'CR No.'}: {companyInfo.cr_number}
              </p>
            )}
            <div className="mt-4 bg-muted/50 py-2 px-4 inline-block rounded">
              <h2 className="text-lg font-bold">
                {language === 'ar' ? 'فاتورة ضريبية' : 'TAX INVOICE'}
              </h2>
            </div>
          </div>

          {/* Invoice & Customer Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {language === 'ar' ? 'بيانات الفاتورة' : 'Invoice Details'}
              </h3>
              <p className="text-sm">
                <strong>{language === 'ar' ? 'رقم الفاتورة:' : 'Invoice No.:'}</strong> {invoice.invoice_no}
              </p>
              <p className="text-sm">
                <strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {formatDateTime(invoice.issued_at)}
              </p>
              <p className="text-sm">
                <strong>{language === 'ar' ? 'رقم الحجز:' : 'Booking Ref:'}</strong> {invoice.reservation?.confirmation_code}
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                {language === 'ar' ? 'بيانات العميل' : 'Customer Details'}
              </h3>
              <p className="text-sm">
                <strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {invoice.reservation?.guest?.full_name}
              </p>
              {invoice.reservation?.guest?.phone && (
                <p className="text-sm">
                  <strong>{language === 'ar' ? 'الهاتف:' : 'Phone:'}</strong> {invoice.reservation.guest.phone}
                </p>
              )}
              {invoice.buyer_vat_number && (
                <p className="text-sm">
                  <strong>{language === 'ar' ? 'الرقم الضريبي:' : 'VAT No.:'}</strong> {invoice.buyer_vat_number}
                </p>
              )}
            </div>
          </div>

          {/* Stay Details */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-2 text-start">
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </th>
                  <th className="border border-border p-2 text-center w-24">
                    {language === 'ar' ? 'الكمية' : 'Qty'}
                  </th>
                  <th className="border border-border p-2 text-end w-32">
                    {language === 'ar' ? 'السعر' : 'Price'}
                  </th>
                  <th className="border border-border p-2 text-end w-32">
                    {language === 'ar' ? 'المجموع' : 'Total'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2">
                    <div className="font-medium">
                      {language === 'ar' 
                        ? invoice.reservation?.unit?.name_ar 
                        : invoice.reservation?.unit?.name_en}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.reservation?.start_date && invoice.reservation?.end_date && (
                        <>
                          {formatDate(invoice.reservation.start_date)} - {formatDate(invoice.reservation.end_date)}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="border border-border p-2 text-center">
                    {invoice.reservation?.nights || 1} {language === 'ar' ? 'ليلة' : 'nights'}
                  </td>
                  <td className="border border-border p-2 text-end">
                    {(invoice.subtotal / (invoice.reservation?.nights || 1)).toFixed(2)} SAR
                  </td>
                  <td className="border border-border p-2 text-end font-medium">
                    {invoice.subtotal.toFixed(2)} SAR
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72">
              <div className="flex justify-between py-2 border-b">
                <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{invoice.subtotal.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>{language === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                <span>{invoice.tax_amount.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-foreground">
                <span>{language === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span>{invoice.total_amount.toFixed(2)} SAR</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {invoice.zatca_qr_code && (
            <div className="mt-8 pt-6 border-t border-dashed text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'ar' ? 'رمز الفاتورة الإلكترونية (زاتكا)' : 'E-Invoice QR Code (ZATCA)'}
              </p>
              <div className="inline-block p-4 bg-white rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invoice.zatca_qr_code)}`}
                  alt="ZATCA QR Code"
                  className="w-36 h-36"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>{language === 'ar' ? 'شكراً لاختياركم' : 'Thank you for staying with us'}</p>
            <p className="mt-1">
              {language === 'ar' ? companyInfo.name_ar : companyInfo.name_en}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
