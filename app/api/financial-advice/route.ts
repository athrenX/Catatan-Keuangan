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

Tolong berikan evaluasi yang membangun. Nilai kesehatan keuangan (score) harus realistis berkisar 0-100 berdasarkan rasio pengeluaran terhadap pemasukan serta kepatuhan anggaran.
Berikan respons dalam JSON objek murni dengan struktur persis seperti di bawah ini, tanpa menggunakan blok kode markdown (\`\`\`json):
{
  "score": 75,
  "summary": "Penjelasan singkat mengenai situasi keuangan pengguna saat ini, kebiasaan belanja mereka, dan apakah mereka melampaui anggaran.",
  "tips": [
    "Tips praktis pertama untuk menghemat pengeluaran.",
    "Tips praktis kedua yang spesifik berdasarkan kategori belanja terbesar mereka.",
    "Tips praktis ketiga tentang investasi atau pengelolaan dana darurat."
  ]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalGeminiApiKey}`;
    
    console.log('Sending request to Gemini API');
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              score: { type: "number" },
              summary: { type: "string" },
              tips: { type: "array", items: { type: "string" } }
            }
          }
        }
      })
    });

    console.log('Gemini API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      
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
    console.log('Gemini API Raw Response:', JSON.stringify(resData).substring(0, 500));
    
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!rawText) {
      console.error('Empty response from Gemini API. Full response:', resData);
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
      const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').replace(/^\s+|\s+$/g, '');
      console.log('Cleaned text:', cleanText.substring(0, 200));
      const parsed = JSON.parse(cleanText);
      
      // Validate parsed response
      if (!parsed.score || !parsed.summary || !Array.isArray(parsed.tips)) {
        throw new Error('Invalid response structure');
      }
      
      return NextResponse.json(parsed);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Raw text:', rawText);
      
      const defaultResponse = {
        score: 70,
        summary: "Kesehatan finansial Anda berada dalam kondisi menengah. Diperlukan penyesuaian dalam pengelolaan anggaran.",
        tips: [
          "Kurangi pengeluaran di kategori dengan nilai tertinggi",
          "Buat rencana tabungan yang realistis dan terukur",
          "Monitor pengeluaran secara berkala untuk melihat progress"
        ]
      };
      return NextResponse.json(defaultResponse);
    }
  } catch (error: any) {
    console.error('Advisor API Error:', error);
    return NextResponse.json({ 
      error: 'Unable to get financial advice. Please try again later.' 
    }, { status: 500 });
  }
}
