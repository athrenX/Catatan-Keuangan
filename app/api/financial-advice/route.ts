import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      transactions = [], 
      budgetLimit = 5000000, 
      totalIncome = 0, 
      totalExpense = 0, 
      geminiApiKey 
    } = body;

    const finalGeminiApiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    if (!finalGeminiApiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured. Set GEMINI_API_KEY environment variable.' }, { status: 400 });
    }

    const prompt = `Anda adalah penasihat keuangan (financial coach) profesional berbahasa Indonesia yang cerdas dan ramah. Analisis data transaksi keuangan pengguna berikut untuk memberikan evaluasi kesehatan finansial dan tips praktis.

Ringkasan Keuangan:
- Batas Anggaran (Budget Limit): Rp ${budgetLimit}
- Total Pemasukan Bulan Ini: Rp ${totalIncome}
- Total Pengeluaran Bulan Ini: Rp ${totalExpense}

Daftar Transaksi Lengkap:
${JSON.stringify(transactions.map((t: any) => ({
      date: t.date,
      type: t.type,
      amount: t.amount,
      description: t.description,
      category: t.category
    })))}

**PENTING: Tolong berikan evaluasi yang membangun dalam format JSON MURNI (bukan Markdown). Nilai kesehatan keuangan (score) harus realistis berkisar 0-100 berdasarkan rasio pengeluaran terhadap pemasukan serta kepatuhan anggaran.

Berikan HANYA JSON object berikut, tanpa teks tambahan, tanpa markdown backticks, tanpa penjelasan apapun:

{
  "score": 75,
  "summary": "Penjelasan singkat mengenai situasi keuangan pengguna saat ini, kebiasaan belanja mereka, dan apakah mereka melampaui anggaran.",
  "tips": [
    "Tips praktis pertama untuk menghemat pengeluaran.",
    "Tips praktis kedua yang spesifik berdasarkan kategori belanja terbesar mereka.",
    "Tips praktis ketiga tentang investasi atau pengelolaan dana darurat."
  ]
}

JANGAN tambahkan markdown code blocks atau teks apapun. HANYA JSON object di atas.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalGeminiApiKey}`;
    
    console.log('🔍 Sending request to Gemini Financial Advisor');
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 1.0,
          responseMimeType: "application/json"
        }
      })
    });

    console.log('✓ Gemini API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      
      const defaultResponse = {
        score: 65,
        summary: "Penilaian keuangan sedang diproses. Silakan coba beberapa saat lagi.",
        tips: [
          "Pantau pengeluaran harian Anda dengan cermat",
          "Tentukan budget untuk setiap kategori pengeluaran",
          "Mulai kebiasaan menabung minimal 10% dari penghasilan"
        ]
      };
      return NextResponse.json(defaultResponse);
    }

    const resData = await response.json();
    console.log('✓ Got response data, extracting text...');
    console.log('Full response structure:', JSON.stringify(resData, null, 2).substring(0, 1000));
    
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('📝 Raw text length:', rawText.length, 'First 500 chars:', rawText.substring(0, 500));
    
    if (!rawText || rawText.length === 0) {
      console.error('❌ Empty response from Gemini API');
      const defaultResponse = {
        score: 75,
        summary: "Analisis keuangan Anda memerlukan data transaksi yang lebih lengkap untuk memberikan rekomendasi yang akurat.",
        tips: [
          "Mulai dengan mencatat semua pengeluaran harian Anda",
          "Kelompokkan pengeluaran berdasarkan kategori untuk melihat pola belanja",
          "Tentukan target budget bulanan untuk setiap kategori pengeluaran"
        ]
      };
      return NextResponse.json(defaultResponse);
    }

    try {
      // Try to parse directly first
      let parsed;
      const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('🔧 Cleaning and parsing JSON...');
      console.log('Cleaned text first 300 chars:', cleanText.substring(0, 300));
      
      // Check if it looks like JSON
      if (!cleanText.startsWith('{')) {
        console.error('❌ Response does not start with {, it starts with:', cleanText.substring(0, 50));
        throw new Error('Response is not valid JSON format');
      }
      
      parsed = JSON.parse(cleanText);
      console.log('✓ Successfully parsed JSON');
      
      // Validate structure
      if (!parsed.score || !parsed.summary || !Array.isArray(parsed.tips)) {
        throw new Error('Missing required fields in response');
      }
      
      console.log('✓ Response validated, returning:', { score: parsed.score });
      return NextResponse.json(parsed);
    } catch (parseError: any) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('Raw text that failed to parse (first 800 chars):', rawText.substring(0, 800));
      
      const defaultResponse = {
        score: 70,
        summary: "Kesehatan finansial Anda berada dalam kondisi menengah. Diperlukan penyesuaian dalam pengelolaan anggaran.",
        tips: [
          "Kurangi pengeluaran di kategori dengan nilai tertinggi",
          "Buat rencana tabungan yang realistis dan terukur",
          "Monitor pengeluaran secara berkala untuk melihat progress"
        ]
      };
      console.log('↩️ Returning default response due to parse error');
      return NextResponse.json(defaultResponse);
    }
  } catch (error: any) {
    console.error('❌ Advisor API Outer Error:', error.message || error);
    console.error('Stack trace:', error.stack);
    
    const fallbackResponse = {
      score: 60,
      summary: "Saat ini kami mengalami kesulitan menganalisis data keuangan Anda. Silakan coba lagi nanti.",
      tips: [
        "Catat semua pengeluaran Anda secara teratur",
        "Buat kategori pengeluaran yang jelas dan terukur",
        "Tentukan target tabungan yang realistis"
      ]
    };
    
    return NextResponse.json(fallbackResponse);
  }
}
