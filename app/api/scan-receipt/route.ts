import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fileData, 
      fileName, 
      veryfiClientId, 
      veryfiUsername, 
      veryfiApiKey, 
      geminiApiKey 
    } = body;

    const finalGeminiApiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    // 1. If Gemini API is configured, use Gemini
    if (finalGeminiApiKey) {
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
      
      const prompt = `Analyze this receipt image. Extract:
1. The total amount spent (Grand Total / Total / Jumlah Bayar). Return as an integer (no cents, clean digits).
2. The merchant/store name (Description / Nama Toko).
3. The category of expense. Choose exactly one from: Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya.
4. An array of purchase items (e.g. ["Pop Mie", "Ciki", "Beras"]). Keep item names short and clear.

Return ONLY a JSON object in this exact format, with no markdown code blocks:
{
  "amount": 150000,
  "description": "Indomaret",
  "category": "Belanja",
  "items": ["Pop Mie", "Ciki", "Beras"]
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalGeminiApiKey}`;
      
      console.log('🔍 Analyzing receipt with Gemini');
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 1.0,
            responseMimeType: "application/json"
          }
        })
      });

      console.log('✓ Gemini Receipt Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error:', response.status, errorText);
        return NextResponse.json({ 
          amount: 0,
          description: 'Receipt analysis failed',
          category: 'Lainnya'
        });
      }

      try {
        const resData = await response.json();
        const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        console.log('📝 Raw text length:', rawText.length);
        
        if (!rawText || rawText.length === 0) {
          console.error('❌ Empty response from Gemini');
          return NextResponse.json({ 
            amount: 0,
            description: 'Unable to read receipt',
            category: 'Lainnya'
          });
        }

        const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        console.log('🔧 Cleaned text:', cleanText.substring(0, 150));
        
        const parsed = JSON.parse(cleanText);
        console.log('✓ Successfully parsed receipt');

        const storeName = parsed.description || 'Belanja Struk';
        const itemsList = Array.isArray(parsed.items) && parsed.items.length > 0
          ? ` (Detail: ${parsed.items.join(', ')})`
          : '';
        const finalDescription = `${storeName}${itemsList}`;

        return NextResponse.json({
          amount: Number(parsed.amount) || 0,
          description: finalDescription,
          category: parsed.category || 'Lainnya'
        });
      } catch (parseError: any) {
        console.error('❌ JSON Parse Error in scan-receipt:', parseError.message);
        return NextResponse.json({ 
          amount: 0,
          description: 'Receipt format not recognized',
          category: 'Lainnya'
        });
      }
    }

    // 2. If Veryfi is configured, use Veryfi
    if (veryfiClientId && veryfiUsername && veryfiApiKey) {
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");

      const response = await fetch('https://api.veryfi.com/api/v8/partner/documents', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'CLIENT-ID': veryfiClientId,
          'Authorization': `apikey ${veryfiUsername}:${veryfiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_data: base64Data,
          file_name: fileName || 'receipt.jpg'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `Veryfi API Error: ${errorText}` }, { status: response.status });
      }

      const data = await response.json();
      const amount = data.total || 0;
      const description = data.vendor?.name || 'Belanja Struk';
      
      let category = 'Lainnya';
      const categoryLower = (data.category || '').toLowerCase();
      const descLower = description.toLowerCase();

      if (/grocery|shopping|supermarket|market|grosir|belanja|store|retail/i.test(categoryLower + descLower)) {
        category = 'Belanja';
      } else if (/meals|food|restaurant|cafe|dining|makan/i.test(categoryLower + descLower)) {
        category = 'Makanan';
      } else if (/travel|transport|taxi|fuel|gas|bensin|ride/i.test(categoryLower + descLower)) {
        category = 'Transportasi';
      } else if (/utilities|bills|telecom|internet|pln|listrik/i.test(categoryLower + descLower)) {
        category = 'Tagihan';
      } else if (/entertainment|game|cinema|bioskop/i.test(categoryLower + descLower)) {
        category = 'Hiburan';
      } else if (/medical|health|pharmacy|apotek|doctor/i.test(categoryLower + descLower)) {
        category = 'Kesehatan';
      } else if (/education|school|book|pendidikan/i.test(categoryLower + descLower)) {
        category = 'Pendidikan';
      }

      return NextResponse.json({
        amount: Math.round(amount),
        description,
        category
      });
    }

    return NextResponse.json({ error: 'No API configuration provided' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Scan API Outer Error:', error.message || error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json({ 
      amount: 0,
      description: 'Error processing receipt. Please try again.',
      category: 'Lainnya'
    }, { status: 500 });
  }
}
