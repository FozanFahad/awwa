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

  // Build HTML content for PDF with proper RTL support
  const html = `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Noto Sans Arabic', Arial, sans-serif; 
      padding: 30px; 
      max-width: 800px; 
      margin: 0 auto; 
      font-size: 12px;
      line-height: 1.6;
      background: #fff;
    }
    
    .header { 
      text-align: center; 
      margin-bottom: 25px; 
      padding-bottom: 20px; 
      border-bottom: 3px solid #1a365d; 
    }
    
    .company-name-en { 
      font-size: 22px; 
      font-weight: 700; 
      color: #1a365d;
      margin-bottom: 5px; 
    }
    
    .company-name-ar { 
      font-size: 20px; 
      font-weight: 700; 
      color: #1a365d;
      direction: rtl;
      unicode-bidi: bidi-override;
      margin-bottom: 10px; 
    }
    
    .company-info { 
      font-size: 11px; 
      color: #666; 
      margin: 4px 0; 
    }
    
    .invoice-title { 
      display: inline-block;
      margin-top: 15px; 
      padding: 10px 30px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: white;
      font-size: 16px; 
      font-weight: 700;
      border-radius: 4px;
    }
    
    .invoice-title-ar {
      direction: rtl;
      unicode-bidi: bidi-override;
    }
    
    .info-section { 
      display: flex; 
      justify-content: space-between; 
      margin: 20px 0; 
      gap: 20px; 
    }
    
    .info-box { 
      flex: 1; 
      padding: 15px; 
      background: #f8fafc; 
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .info-box-title { 
      font-size: 11px; 
      color: #64748b; 
      margin-bottom: 10px; 
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .info-box-title-ar {
      direction: rtl;
      unicode-bidi: bidi-override;
      text-align: right;
    }
    
    .info-row { 
      font-size: 12px; 
      margin: 6px 0;
      display: flex;
      justify-content: space-between;
    }
    
    .info-label { 
      color: #64748b;
      font-weight: 500;
    }
    
    .info-value { 
      font-weight: 600;
      color: #1e293b;
    }
    
    .info-value-ar {
      direction: rtl;
      unicode-bidi: bidi-override;
    }
    
    .items-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .items-table th { 
      background: #1a365d;
      color: white;
      padding: 12px; 
      text-align: left;
      font-weight: 600;
      font-size: 11px;
    }
    
    .items-table td { 
      border-bottom: 1px solid #e2e8f0; 
      padding: 12px; 
      background: #fff;
    }
    
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    
    .item-name-ar {
      direction: rtl;
      unicode-bidi: bidi-override;
      display: block;
      color: #64748b;
      font-size: 11px;
      margin-top: 2px;
    }
    
    .totals-section { 
      display: flex;
      justify-content: flex-end;
      margin: 20px 0; 
    }
    
    .totals-box { 
      width: 280px;
      background: #f8fafc;
      border-radius: 8px;
      padding: 15px;
      border: 1px solid #e2e8f0;
    }
    
    .totals-row { 
      display: flex; 
      justify-content: space-between; 
      padding: 8px 0;
      font-size: 12px;
    }
    
    .totals-row.subtotal {
      border-bottom: 1px solid #e2e8f0;
    }
    
    .totals-row.total { 
      border-top: 2px solid #1a365d;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 16px; 
      font-weight: 700;
      color: #1a365d;
    }
    
    .qr-section { 
      text-align: center; 
      margin-top: 30px; 
      padding-top: 20px; 
      border-top: 2px dashed #e2e8f0; 
    }
    
    .qr-label { 
      font-size: 11px; 
      color: #64748b; 
      margin-bottom: 10px; 
    }
    
    .qr-image {
      background: white;
      padding: 10px;
      display: inline-block;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      padding-top: 20px; 
      border-top: 1px solid #e2e8f0; 
      font-size: 11px; 
      color: #64748b; 
    }
    
    .footer-ar {
      direction: rtl;
      unicode-bidi: bidi-override;
    }

    @media print {
      body { padding: 20px; }
      .items-table { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name-en">${companyInfo.name_en}</div>
    <div class="company-name-ar">${companyInfo.name_ar}</div>
    <p class="company-info">${companyInfo.address_en}</p>
    <p class="company-info">VAT No.: ${companyInfo.vat_number} | الرقم الضريبي</p>
    ${companyInfo.cr_number ? `<p class="company-info">CR No.: ${companyInfo.cr_number} | السجل التجاري</p>` : ''}
    <div class="invoice-title">
      TAX INVOICE | <span class="invoice-title-ar">فاتورة ضريبية</span>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <div class="info-box-title">Invoice Details | <span class="info-box-title-ar">بيانات الفاتورة</span></div>
      <div class="info-row">
        <span class="info-label">Invoice No.:</span>
        <span class="info-value">${invoice.invoice_no}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${formatDateTime(invoice.issued_at)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Booking Ref:</span>
        <span class="info-value">${invoice.reservation?.confirmation_code || '-'}</span>
      </div>
    </div>
    <div class="info-box">
      <div class="info-box-title">Customer Details | <span class="info-box-title-ar">بيانات العميل</span></div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value info-value-ar">${invoice.reservation?.guest?.full_name || '-'}</span>
      </div>
      ${invoice.reservation?.guest?.phone ? `
      <div class="info-row">
        <span class="info-label">Phone:</span>
        <span class="info-value">${invoice.reservation.guest.phone}</span>
      </div>
      ` : ''}
      ${invoice.buyer_vat_number ? `
      <div class="info-row">
        <span class="info-label">VAT No.:</span>
        <span class="info-value">${invoice.buyer_vat_number}</span>
      </div>
      ` : ''}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%">Description | الوصف</th>
        <th class="text-center" style="width: 15%">Qty | الكمية</th>
        <th class="text-right" style="width: 17%">Unit Price | السعر</th>
        <th class="text-right" style="width: 18%">Total | المجموع</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${invoice.reservation?.unit?.name_en || 'Accommodation'}</strong>
          ${invoice.reservation?.unit?.name_ar ? `<span class="item-name-ar">${invoice.reservation.unit.name_ar}</span>` : ''}
          <br/>
          <span style="font-size:10px;color:#64748b">
            ${invoice.reservation?.start_date ? formatDate(invoice.reservation.start_date) : ''} - 
            ${invoice.reservation?.end_date ? formatDate(invoice.reservation.end_date) : ''}
          </span>
        </td>
        <td class="text-center">${nights} nights | ليلة</td>
        <td class="text-right">${pricePerNight} SAR</td>
        <td class="text-right"><strong>${invoice.subtotal.toFixed(2)} SAR</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-box">
      <div class="totals-row subtotal">
        <span>Subtotal | المجموع الفرعي</span>
        <span>${invoice.subtotal.toFixed(2)} SAR</span>
      </div>
      <div class="totals-row">
        <span>VAT 15% | ضريبة القيمة المضافة</span>
        <span>${invoice.tax_amount.toFixed(2)} SAR</span>
      </div>
      <div class="totals-row total">
        <span>Total | الإجمالي</span>
        <span>${invoice.total_amount.toFixed(2)} SAR</span>
      </div>
    </div>
  </div>

  ${invoice.zatca_qr_code ? `
  <div class="qr-section">
    <p class="qr-label">E-Invoice QR Code (ZATCA) | رمز الفاتورة الإلكترونية</p>
    <div class="qr-image">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(invoice.zatca_qr_code)}" alt="QR Code" />
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for staying with us | <span class="footer-ar">شكراً لاختياركم</span></p>
    <p style="margin-top:8px;font-weight:600">${companyInfo.name_en} | <span class="footer-ar">${companyInfo.name_ar}</span></p>
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Extract and verify Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT to respect RLS policies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { invoiceId, companyInfo } = await req.json();

    if (!invoiceId) {
      console.error('Missing invoiceId');
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching invoice:', invoiceId);

    // Fetch invoice data - RLS policies will enforce access control
    // (Staff can view all, guests can only view their own invoices)
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

    if (invoiceError) {
      console.error('Invoice fetch error:', invoiceError);
      // Check if it's a permission error (no rows returned due to RLS)
      if (invoiceError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Invoice not found or access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invoice) {
      console.error('Invoice not found');
      return new Response(
        JSON.stringify({ error: 'Invoice not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      JSON.stringify({ error: 'An error occurred while generating the invoice' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
