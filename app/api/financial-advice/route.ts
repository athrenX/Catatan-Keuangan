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
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Gemini API Error: ${errorText}` }, { status: response.status });
    }

    const resData = await response.json();
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Advisor API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
