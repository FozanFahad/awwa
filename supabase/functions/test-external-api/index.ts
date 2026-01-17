import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiUrl, apiToken, endpoint } = await req.json();
    
    // First, try to get CSRF cookie from /sanctum/csrf-cookie
    const baseUrl = apiUrl.replace('/api', '');
    let csrfCookies = '';
    
    try {
      const csrfResponse = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      csrfCookies = csrfResponse.headers.get('set-cookie') || '';
    } catch (e) {
      console.log('CSRF fetch failed:', e);
    }
    
    // Extract XSRF-TOKEN from cookies
    const xsrfMatch = csrfCookies.match(/XSRF-TOKEN=([^;]+)/);
    const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : '';
    
    // Try with XSRF token
    const response = await fetch(`${apiUrl}${endpoint || '/me'}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': csrfCookies,
      },
    });
    
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    
    if (response.status === 200) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: response.status,
          data,
          authMethod: 'Bearer + XSRF'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Last resort - check if maybe the base URL needs /b removed
    const altBaseUrls = [
      apiUrl,
      apiUrl.replace('/b/api', '/api'),
      'https://awa.alostaz.io/api',
    ];
    
    for (const altUrl of altBaseUrls) {
      try {
        const altResponse = await fetch(`${altUrl}${endpoint || '/me'}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Accept': 'application/json',
          },
        });
        
        let altData = null;
        try {
          altData = await altResponse.json();
        } catch {
          altData = await altResponse.text();
        }
        
        if (altResponse.status === 200) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              status: altResponse.status,
              data: altData,
              workingUrl: altUrl,
              authMethod: 'Bearer'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        // Continue trying
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        status: response.status,
        data,
        csrfCookies: csrfCookies ? 'Found CSRF cookies' : 'No CSRF cookies',
        xsrfToken: xsrfToken ? 'Found XSRF token' : 'No XSRF token',
        message: 'الـ Token قد يكون منتهي الصلاحية أو غير صالح. يرجى التحقق من Token جديد من النظام المحاسبي.',
        testedUrls: altBaseUrls,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
