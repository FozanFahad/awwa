import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF generation using basic text layout
function generatePDFContent(invoice: any, companyInfo: any): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${formatDate(dateStr)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const nights = invoice.reservation?.nights || 1;
  const pricePerNight = (invoice.subtotal / nights).toFixed(2);

  // Build HTML content for PDF
  const html = `
<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 12px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .company-name-ar { font-size: 20px; font-weight: bold; direction: rtl; margin-bottom: 10px; }
    .company-info { font-size: 11px; color: #666; margin: 3px 0; }
    .invoice-title { font-size: 18px; font-weight: bold; background: #f0f0f0; padding: 10px 20px; display: inline-block; margin-top: 15px; }
    .info-grid { display: flex; justify-content: space-between; margin: 25px 0; gap: 20px; }
    .info-box { flex: 1; padding: 15px; background: #f9f9f9; border-radius: 5px; }
    .info-box h3 { font-size: 12px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
    .info-box p { font-size: 11px; margin: 5px 0; }
    .info-box strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 25px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f0f0f0; font-weight: 600; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { margin: 25px 0; }
    .totals-row { display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; }
    .totals-table td { padding: 8px 12px; border: none; }
    .totals-table .label { text-align: left; color: #666; }
    .totals-table .value { text-align: right; font-weight: 500; }
    .totals-table .total-row { border-top: 2px solid #333; font-size: 16px; font-weight: bold; }
    .qr-section { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #ccc; }
    .qr-label { font-size: 11px; color: #666; margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${companyInfo.name_en}</div>
    <div class="company-name-ar">${companyInfo.name_ar}</div>
    <p class="company-info">${companyInfo.address_en}</p>
    <p class="company-info">VAT No. / الرقم الضريبي: ${companyInfo.vat_number}</p>
    ${companyInfo.cr_number ? `<p class="company-info">CR No. / السجل التجاري: ${companyInfo.cr_number}</p>` : ''}
    <div class="invoice-title">TAX INVOICE / فاتورة ضريبية</div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Invoice Details / بيانات الفاتورة</h3>
      <p><strong>Invoice No.:</strong> ${invoice.invoice_no}</p>
      <p><strong>Date:</strong> ${formatDateTime(invoice.issued_at)}</p>
      <p><strong>Booking Ref:</strong> ${invoice.reservation?.confirmation_code || '-'}</p>
    </div>
    <div class="info-box">
      <h3>Customer Details / بيانات العميل</h3>
      <p><strong>Name:</strong> ${invoice.reservation?.guest?.full_name || '-'}</p>
      ${invoice.reservation?.guest?.phone ? `<p><strong>Phone:</strong> ${invoice.reservation.guest.phone}</p>` : ''}
      ${invoice.buyer_vat_number ? `<p><strong>VAT No.:</strong> ${invoice.buyer_vat_number}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description / الوصف</th>
        <th class="text-center">Qty / الكمية</th>
        <th class="text-right">Unit Price / السعر</th>
        <th class="text-right">Total / المجموع</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${invoice.reservation?.unit?.name_en || 'Accommodation'}</strong>
          ${invoice.reservation?.unit?.name_ar ? `<br/><span style="direction:rtl">${invoice.reservation.unit.name_ar}</span>` : ''}
          <br/>
          <span style="font-size:10px;color:#666">
            ${invoice.reservation?.start_date ? formatDate(invoice.reservation.start_date) : ''} - 
            ${invoice.reservation?.end_date ? formatDate(invoice.reservation.end_date) : ''}
          </span>
        </td>
        <td class="text-center">${nights} nights</td>
        <td class="text-right">${pricePerNight} SAR</td>
        <td class="text-right"><strong>${invoice.subtotal.toFixed(2)} SAR</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <table class="totals-table">
        <tr>
          <td class="label">Subtotal / المجموع الفرعي</td>
          <td class="value">${invoice.subtotal.toFixed(2)} SAR</td>
        </tr>
        <tr>
          <td class="label">VAT 15% / ضريبة القيمة المضافة</td>
          <td class="value">${invoice.tax_amount.toFixed(2)} SAR</td>
        </tr>
        <tr class="total-row">
          <td class="label">Total / الإجمالي</td>
          <td class="value">${invoice.total_amount.toFixed(2)} SAR</td>
        </tr>
      </table>
    </div>
  </div>

  ${invoice.zatca_qr_code ? `
  <div class="qr-section">
    <p class="qr-label">E-Invoice QR Code (ZATCA) / رمز الفاتورة الإلكترونية</p>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(invoice.zatca_qr_code)}" alt="QR Code" />
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for staying with us / شكراً لاختياركم</p>
    <p style="margin-top:5px">${companyInfo.name_en} | ${companyInfo.name_ar}</p>
  </div>
</body>
</html>
  `;

  return html;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { invoiceId, companyInfo } = await req.json();

    if (!invoiceId) {
      console.error('Missing invoiceId');
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching invoice:', invoiceId);

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        reservation:reservations(
          confirmation_code,
          start_date,
          end_date,
          nights,
          guest:guests(full_name, phone, email),
          unit:units(name_en, name_ar)
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceError);
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating PDF for invoice:', invoice.invoice_no);

    // Generate HTML content
    const htmlContent = generatePDFContent(invoice, companyInfo);

    // Return HTML that can be printed/saved as PDF by the browser
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating PDF:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
