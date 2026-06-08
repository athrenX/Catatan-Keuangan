# 📱 Catatan Keuangan - Financial Receipt Scanner

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Aplikasi web modern untuk menganalisis dan mencatat transaksi keuangan dari foto struk/invoice secara otomatis menggunakan teknologi **OCR** (Optical Character Recognition) dan **AI**.

## ✨ Fitur Utama

- 📸 **Smart Receipt Scanning** - Upload foto struk untuk ekstraksi data otomatis
- 💡 **Financial Advice** - Dapatkan rekomendasi keuangan berdasarkan pola transaksi
- 💾 **Database Terintegrasi** - Simpan dan kelola data transaksi dengan Supabase
- 🎨 **UI/UX Modern** - Interface responsif dan user-friendly dengan Tailwind CSS
- 🔐 **Keamanan Tingkat Produksi** - Perlindungan API keys dan data sensitif

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend Framework** | Next.js 16, React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4, PostCSS |
| **Database** | Supabase (PostgreSQL) |
| **Client SDK** | @supabase/supabase-js |
| **OCR Engine** | Tesseract.js |
| **UI Components** | Heroicons, Lucide React |
| **Development** | ESLint, Node 18+ |

## 📋 Prerequisites

- Node.js 18.0 atau lebih tinggi
- npm atau yarn
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/athrenX/Catatan-Keuangan.git
cd Catatan-Keuangan/artifacts
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` dan masukkan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anonymous_key_here
```

**Dapatkan kredensial dari:**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Settings → API → URL dan anon key

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka browser dan navigasi ke [http://localhost:3000](http://localhost:3000)

### 5. Build untuk Production
```bash
npm run build
npm run start
```

## 📦 API Endpoints

### `POST /api/scan-receipt`
Menganalisis dan mengekstrak data dari foto struk menggunakan OCR.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgA..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "merchant": "Supermarket ABC",
    "total": 125000,
    "date": "2026-06-08",
    "items": [...]
  }
}
```

### `POST /api/financial-advice`
Memberikan saran keuangan berdasarkan pola transaksi pengguna.

**Request:**
```json
{
  "transactions": [
    {
      "merchant": "Restaurant",
      "amount": 50000,
      "category": "Food"
    }
  ]
}
```

**Response:**
```json
{
  "advice": "Pengeluaran makan diluar terlalu tinggi. Coba kurangi 20%.",
  "budget_suggestion": {...}
}
```

## 📁 Project Structure

```
artifacts/
├── app/
│   ├── api/
│   │   ├── financial-advice/
│   │   │   └── route.ts          # Financial advice endpoint
│   │   └── scan-receipt/
│   │       └── route.ts          # Receipt scanning endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── lib/
│   └── supabase.ts                # Supabase client config
├── public/
│   └── ...                        # Static assets
├── .env.example                   # Environment template
├── .env.local                     # Environment (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## 🚀 Deployment

### Deploy ke Vercel (Rekomendasi)

1. **Push ke GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Buka Vercel:**
   - Kunjungi [vercel.com](https://vercel.com)
   - Klik "Add New..." → "Project"
   - Import repository GitHub Anda

3. **Konfigurasi Environment Variables:**
   - Di dashboard Vercel, pergi ke Settings → Environment Variables
   - Tambahkan:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Klik tombol "Deploy"
   - Setiap push ke `main` akan otomatis di-deploy

### Deploy Manual

```bash
npm run build
npm run start
```

## 🔒 Security Best Practices

✅ **API Keys Protection:**
- File `.env.local` sudah tercakup dalam `.gitignore`
- Semua file `.env*` tidak akan ter-commit ke repository
- Gunakan `.env.example` sebagai template untuk contributor lain

✅ **Environment Management:**
- `NEXT_PUBLIC_*` variables aman untuk browser (tidak sensitif)
- Private variables tidak di-prefix `NEXT_PUBLIC_`

⚠️ **Panduan Keamanan:**
- Jangan pernah commit file `.env.local`
- Jangan share API keys melalui chat/email
- Rotate keys secara berkala
- Monitor penggunaan API di Supabase dashboard

## 🤝 Contributing

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 📞 Support

Jika ada pertanyaan atau menemukan bug, silakan:
- Buka [Issue](https://github.com/athrenX/Catatan-Keuangan/issues)
- Komentari di discussion
- Hubungi maintainer

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Heroicons](https://heroicons.com) - UI icons

---

**Made with ❤️ by [@athrenX](https://github.com/athrenX)**

Last updated: June 8, 2026
