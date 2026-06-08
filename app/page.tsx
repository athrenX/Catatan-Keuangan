'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  WalletIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  InformationCircleIcon,
  SunIcon,
  MoonIcon,
  Squares2X2Icon,
  ReceiptPercentIcon,
  ChartPieIcon,
  ArrowRightOnRectangleIcon,
  UserIcon as BaseUserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Tailwind Wrapper for Heroicons to support dynamic size mapping using utility classes
const wrapIcon = (IconComponent: React.ComponentType<any>) => {
  return ({ size = 20, className = '', ...props }: any) => {
    let sizeClass = 'w-5 h-5';
    if (size <= 14) sizeClass = 'w-3.5 h-3.5';
    else if (size <= 16) sizeClass = 'w-4 h-4';
    else if (size <= 20) sizeClass = 'w-5 h-5';
    else if (size <= 24) sizeClass = 'w-6 h-6';
    else if (size <= 32) sizeClass = 'w-8 h-8';
    
    return <IconComponent className={`${sizeClass} ${className}`} {...props} />;
  };
};

const Plus = wrapIcon(PlusIcon);
const Trash2 = wrapIcon(TrashIcon);
const Edit2 = wrapIcon(PencilIcon);
const Download = wrapIcon(ArrowDownTrayIcon);
const TrendingUp = wrapIcon(ArrowTrendingUpIcon);
const Search = wrapIcon(MagnifyingGlassIcon);
const X = wrapIcon(XMarkIcon);
const Wallet = wrapIcon(WalletIcon);
const ArrowUpRight = wrapIcon(ArrowUpRightIcon);
const ArrowDownLeft = wrapIcon(ArrowDownLeftIcon);
const Info = wrapIcon(InformationCircleIcon);
const Sun = wrapIcon(SunIcon);
const Moon = wrapIcon(MoonIcon);
const LayoutDashboard = wrapIcon(Squares2X2Icon);
const Receipt = wrapIcon(ReceiptPercentIcon);
const ChartIcon = wrapIcon(ChartPieIcon);
const LogOut = wrapIcon(ArrowRightOnRectangleIcon);
const UserIcon = wrapIcon(BaseUserIcon);
const Mail = wrapIcon(EnvelopeIcon);
const ShieldCheck = wrapIcon(ShieldCheckIcon);
const Lock = wrapIcon(LockClosedIcon);
const Settings = wrapIcon(Cog6ToothIcon);
const Sparkles = wrapIcon(SparklesIcon);
import Tesseract from 'tesseract.js';
import { supabase } from '../lib/supabase';
import {
  Briefcase,
  Laptop,
  TrendingUp as LucideTrendingUp,
  Gift,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Gamepad2,
  Heart,
  GraduationCap,
  Tag
} from 'lucide-react';

const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-project') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-supabase-anon')
);

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  receiptImage?: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: 'monthly' | 'weekly';
  nextDueDate: string;
  isActive: boolean;
}

const categories = {
  income: ['Gaji', 'Freelance', 'Investasi', 'Hadiah', 'Lainnya'],
  expense: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya']
};

const categoryMetadata: Record<string, { icon: React.ComponentType<any>; color: string; strokeColor: string; bgColor: string; lightColor: string; lightBgColor: string }> = {
  // Income
  'Gaji': { icon: Briefcase, color: 'text-emerald-400', strokeColor: 'stroke-emerald-400', bgColor: 'bg-emerald-500/10', lightColor: 'text-emerald-600', lightBgColor: 'bg-emerald-50' },
  'Freelance': { icon: Laptop, color: 'text-teal-400', strokeColor: 'stroke-teal-400', bgColor: 'bg-teal-500/10', lightColor: 'text-teal-600', lightBgColor: 'bg-teal-50' },
  'Investasi': { icon: LucideTrendingUp, color: 'text-cyan-400', strokeColor: 'stroke-cyan-400', bgColor: 'bg-cyan-500/10', lightColor: 'text-cyan-600', lightBgColor: 'bg-cyan-50' },
  'Hadiah': { icon: Gift, color: 'text-pink-400', strokeColor: 'stroke-pink-400', bgColor: 'bg-pink-500/10', lightColor: 'text-pink-600', lightBgColor: 'bg-pink-50' },
  // Expense
  'Makanan': { icon: Utensils, color: 'text-amber-400', strokeColor: 'stroke-amber-400', bgColor: 'bg-amber-500/10', lightColor: 'text-amber-600', lightBgColor: 'bg-amber-50' },
  'Transportasi': { icon: Car, color: 'text-blue-400', strokeColor: 'stroke-blue-400', bgColor: 'bg-blue-500/10', lightColor: 'text-blue-600', lightBgColor: 'bg-blue-50' },
  'Belanja': { icon: ShoppingBag, color: 'text-purple-400', strokeColor: 'stroke-purple-400', bgColor: 'bg-purple-500/10', lightColor: 'text-purple-600', lightBgColor: 'bg-purple-50' },
  'Tagihan': { icon: Zap, color: 'text-rose-400', strokeColor: 'stroke-rose-400', bgColor: 'bg-rose-500/10', lightColor: 'text-rose-600', lightBgColor: 'bg-rose-50' },
  'Hiburan': { icon: Gamepad2, color: 'text-orange-400', strokeColor: 'stroke-orange-400', bgColor: 'bg-orange-500/10', lightColor: 'text-orange-650', lightBgColor: 'bg-orange-50' },
  'Kesehatan': { icon: Heart, color: 'text-red-400', strokeColor: 'stroke-red-400', bgColor: 'bg-red-500/10', lightColor: 'text-red-650', lightBgColor: 'bg-red-50' },
  'Pendidikan': { icon: GraduationCap, color: 'text-indigo-400', strokeColor: 'stroke-indigo-400', bgColor: 'bg-indigo-500/10', lightColor: 'text-indigo-650', lightBgColor: 'bg-indigo-50' },
  // Common
  'Lainnya': { icon: Tag, color: 'text-zinc-400', strokeColor: 'stroke-zinc-400', bgColor: 'bg-zinc-500/10', lightColor: 'text-zinc-650', lightBgColor: 'bg-zinc-100' },
};

// Indonesian Currency Formatter
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Convert number to Indonesian words (Terbilang)
function getTerbilang(n: number): string {
  if (n === 0) return 'Nol';
  return convertToWords(n).trim() + ' Rupiah';
}

function convertToWords(n: number): string {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  if (n < 12) return bilangan[n];
  if (n < 20) return bilangan[n - 10] + ' Belas';
  if (n < 100) return bilangan[Math.floor(n / 10)] + ' Puluh ' + convertToWords(n % 10);
  if (n < 200) return 'Seratus ' + convertToWords(n - 100);
  if (n < 1000) return bilangan[Math.floor(n / 100)] + ' Ratus ' + convertToWords(n % 100);
  if (n < 2000) return 'Seribu ' + convertToWords(n - 1000);
  if (n < 1000000) return convertToWords(Math.floor(n / 1000)) + ' Ribu ' + convertToWords(n % 1000);
  if (n < 1000000000) return convertToWords(Math.floor(n / 1000000)) + ' Juta ' + convertToWords(n % 1000000);
  if (n < 1000000000000) return convertToWords(Math.floor(n / 1000000000)) + ' Miliar ' + convertToWords(n % 1000000000);
  return '';
}

// Receipt text scanner and parser logic
const parseReceiptText = (text: string) => {
  const lines = text.split('\n').map(line => line.trim());
  const textLower = text.toLowerCase();
  
  // Helpers to parse numbers
  const extractNumbersFromLine = (lineText: string): number[] => {
    const clean = lineText.toLowerCase()
      .replace(/t0tal/g, 'total')
      .replace(/tota1/g, 'total')
      .replace(/t0ta1/g, 'total')
      .replace(/ju1mah/g, 'jumlah')
      .replace(/r[pqo90\s]/g, 'rp');
      
    const matches = clean.match(/[0-9.,]+/g) || [];
    const values: number[] = [];
    
    for (const matchStr of matches) {
      let cleanMatch = matchStr;
      if (cleanMatch.endsWith(',00') || cleanMatch.endsWith('.00')) {
        cleanMatch = cleanMatch.slice(0, -3);
      }
      const digits = cleanMatch.replace(/[^0-9]/g, '');
      const val = parseInt(digits, 10);
      if (!isNaN(val) && val > 0) {
        values.push(val);
      }
    }
    return values;
  };

  let detectedAmount = 0;
  
  // 1. High-priority keyword check (Grand Total, Total, Jumlah, Subtotal)
  const priorityKeywords = [
    /grand\s*total/i,
    /total\s*rp/i,
    /total\s*spent/i,
    /total\s*item/i,
    /total/i,
    /jumlah\s*bayar/i,
    /jumlah\s*harga/i,
    /jumlah/i,
    /subtotal/i,
    /netto/i,
    /due/i
  ];

  for (const keyword of priorityKeywords) {
    for (const line of lines) {
      if (keyword.test(line)) {
        const nums = extractNumbersFromLine(line);
        // Look for a reasonable transaction amount (between 1,000 and 10,000,000)
        const validNum = nums.find(n => n >= 1000 && n < 10000000);
        if (validNum) {
          detectedAmount = validNum;
          break;
        }
      }
    }
    if (detectedAmount > 0) break;
  }

  // 2. Fallback: Search all lines, excluding payment methods and change
  if (detectedAmount === 0) {
    let maxNumber = 0;
    for (const line of lines) {
      const isPaymentOrChangeLine = /kembali|kembalian|change|cash|tunai|bayar|kembalian|debit|kartu|card|visa|master/i.test(line);
      const isDateOrTimeLine = /tanggal|date|telp|phone|invoice|receipt|nota|kasir|waktu|time/i.test(line);
      
      // Ignore lines that are definitely not the main item purchase lines
      if (!isPaymentOrChangeLine && !isDateOrTimeLine) {
        const nums = extractNumbersFromLine(line);
        for (const num of nums) {
          const numStr = num.toString();
          if (num > maxNumber && num < 5000000 && numStr.length >= 4 && numStr.length <= 7) {
            maxNumber = num;
          }
        }
      }
    }
    detectedAmount = maxNumber;
  }

  // 3. Extract description (merchant name)
  let detectedDescription = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length >= 3 && 
      trimmed.length <= 35 && 
      /[a-zA-Z]/.test(trimmed) && 
      !/[0-9]{5,}/.test(trimmed) && 
      !/tanggal|date|telp|phone|invoice|receipt|nota|cashier|kasir|waktu|time|promo|diskon|discount/i.test(trimmed)
    ) {
      detectedDescription = trimmed.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
      break;
    }
  }
  
  if (!detectedDescription) {
    detectedDescription = 'Belanja Struk';
  }

  // 4. Match category
  let detectedCategory = 'Lainnya';
  
  if (/indo|alfa|mart|supermarket|market|grosir|belanja|hypermart|carrefour|transmart|watsons|guardian|toko|minyak|beras|sabun/i.test(textLower)) {
    detectedCategory = 'Belanja';
  } else if (/gojek|grab|uber|taxi|bensin|pertamina|shell|transport|tol|parkir|ojek|mrt|lrt|krl|kereta|flight|travel/i.test(textLower)) {
    detectedCategory = 'Transportasi';
  } else if (/resto|cafe|kopi|coffee|makan|food|warung|bakso|mie|kfc|mcd|burger|pizza|bakery|roti|dapur|kantin|restaurant|solaria|hokben/i.test(textLower)) {
    detectedCategory = 'Makanan';
  } else if (/pln|listrik|pdam|telkom|wifi|internet|bpjs|asuransi|tagihan|kartu kredit|shopeepay|gopay|ovo|dana/i.test(textLower)) {
    detectedCategory = 'Tagihan';
  } else if (/game|nonton|bioskop|cgv|xxi|hiburan|rekreasi|funworld|timezone|karaoke|ticket|tiket/i.test(textLower)) {
    detectedCategory = 'Hiburan';
  } else if (/apotek|dokter|klinik|obat|sakit|rs|puskesmas|health|pharma|kimia farma/i.test(textLower)) {
    detectedCategory = 'Kesehatan';
  } else if (/sekolah|buku|kursus|kuliah|pendidikan|spp|toko buku|gramedia/i.test(textLower)) {
    detectedCategory = 'Pendidikan';
  }
  
  return {
    amount: detectedAmount,
    category: detectedCategory,
    description: detectedDescription
  };
};

export default function FinanceTracker() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Transactions & Budget State (per user session)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimit] = useState(5000000);
  const [budgetInput, setBudgetInput] = useState('5000000');

  // Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: ''
  });
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [fundsAmountInput, setFundsAmountInput] = useState('');
  const [isDeductFromBalance, setIsDeductFromBalance] = useState(true);

  // Recurring Transactions State
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);
  const [recurringForm, setRecurringForm] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    frequency: 'monthly' as 'monthly' | 'weekly',
    nextDueDate: '',
    isActive: true
  });

  // Layout Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Mobile Navigation Active Tab
  const [mobileTab, setMobileTab] = useState<'overview' | 'transactions' | 'analysis'>('overview');

  const [filterMonth, setFilterMonth] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync filterMonth with selected filterDate's month
  useEffect(() => {
    if (filterDate) {
      const monthPart = filterDate.slice(0, 7); // "YYYY-MM"
      if (monthPart !== filterMonth) {
        setFilterMonth(monthPart);
      }
    }
  }, [filterDate, filterMonth]);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  const [activeReceiptImage, setActiveReceiptImage] = useState<string | null>(null);
  const [selectedTransactionForDetails, setSelectedTransactionForDetails] = useState<Transaction | null>(null);

  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: '',
    receiptImage: '',
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [scanError, setScanError] = useState('');
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);

  // AI Keys Config State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [veryfiClientId, setVeryfiClientId] = useState('');
  const [veryfiUsername, setVeryfiUsername] = useState('');
  const [veryfiApiKey, setVeryfiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // AI Advisor State
  const [advisorAdvice, setAdvisorAdvice] = useState<{ score: number; summary: string; tips: string[] } | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState('');

  // Load configuration on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedVeryfiClientId = localStorage.getItem('veryfi_client_id') || '';
    const savedVeryfiUsername = localStorage.getItem('veryfi_username') || '';
    const savedVeryfiApiKey = localStorage.getItem('veryfi_api_key') || '';
    const savedGeminiApiKey = localStorage.getItem('gemini_api_key') || '';
    setVeryfiClientId(savedVeryfiClientId);
    setVeryfiUsername(savedVeryfiUsername);
    setVeryfiApiKey(savedVeryfiApiKey);
    setGeminiApiKey(savedGeminiApiKey);
    
    // Set initial dates
    setFilterMonth(new Date().toISOString().slice(0, 7));
    setForm(prev => ({
      ...prev,
      date: new Date().toISOString().slice(0, 10),
    }));
    
    setMounted(true);

    // Initial session load
    const getInitialSession = async () => {
      let supabaseSession = null;
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          supabaseSession = session;
        } catch (e) {
          console.error('Error getting Supabase session:', e);
        }
      }

      if (supabaseSession?.user) {
        const loggedUser: User = {
          id: supabaseSession.user.id,
          name: supabaseSession.user.user_metadata.full_name || supabaseSession.user.email?.split('@')[0] || 'User',
          email: supabaseSession.user.email || '',
          avatarUrl: supabaseSession.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${supabaseSession.user.email}&radius=50&backgroundColor=059669`
        };
        setUser(loggedUser);

        // Load local cache for instant paint before network response
        const cached = localStorage.getItem(`transactions_${loggedUser.email}`);
        if (cached) {
          try {
            setTransactions(JSON.parse(cached));
          } catch (e) {
            console.error('Error parsing cached transactions:', e);
          }
        }

        fetchTransactions(supabaseSession.user.id, loggedUser.email);
        loadBudget(supabaseSession.user.id);
        loadSavingsGoalsAndRecurring(loggedUser.email);
      } else {
        // Fallback check if user is logged in locally
        const savedUser = localStorage.getItem('logged_in_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          loadLocalUserData(parsedUser.email);
        }
      }
    };
    getInitialSession();

    // Session status subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isSupabaseConfigured) return;

      if (session?.user) {
        const loggedUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatarUrl: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}&radius=50&backgroundColor=059669`
        };
        setUser(loggedUser);

        // Load local cache for instant paint before network response
        const cached = localStorage.getItem(`transactions_${loggedUser.email}`);
        if (cached) {
          try {
            setTransactions(JSON.parse(cached));
          } catch (e) {
            console.error('Error parsing cached transactions:', e);
          }
        }

        fetchTransactions(session.user.id, loggedUser.email);
        loadBudget(session.user.id);
        loadSavingsGoalsAndRecurring(loggedUser.email);
      } else {
        const savedUser = localStorage.getItem('logged_in_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          loadLocalUserData(parsedUser.email);
        } else {
          setUser(null);
          setTransactions([]);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchTransactions = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) {
        const enriched = data.map((t: any) => ({
          ...t,
          receiptImage: localStorage.getItem(`receipt_image_${t.id}`) || undefined
        }));
        setTransactions(enriched);
        if (userEmail) {
          localStorage.setItem(`transactions_${userEmail}`, JSON.stringify(enriched));
        }
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const loadBudget = (userId: string) => {
    const userBudget = localStorage.getItem(`budget_limit_${userId}`);
    if (userBudget) {
      setBudgetLimit(parseInt(userBudget));
      setBudgetInput(userBudget);
    } else {
      setBudgetLimit(5000000);
      setBudgetInput('5000000');
    }
  };

  // Helper to load user specific data (Local Mode fallback)
  const loadLocalUserData = (email: string) => {
    const userTransactions = localStorage.getItem(`transactions_${email}`);
    if (userTransactions) {
      const parsed = JSON.parse(userTransactions) as Transaction[];
      const enriched = parsed.map(t => ({
        ...t,
        receiptImage: localStorage.getItem(`receipt_image_${t.id}`) || undefined
      }));
      setTransactions(enriched);
    } else {
      setTransactions([]);
    }

    const userBudget = localStorage.getItem(`budget_limit_${email}`);
    if (userBudget) {
      setBudgetLimit(parseInt(userBudget));
      setBudgetInput(userBudget);
    } else {
      setBudgetLimit(5000000);
      setBudgetInput('5000000');
    }

    loadSavingsGoalsAndRecurring(email);
  };

  const loadSavingsGoalsAndRecurring = (email: string) => {
    const savedGoals = localStorage.getItem(`savings_goals_${email}`);
    setSavingsGoals(savedGoals ? JSON.parse(savedGoals) : []);
    const savedRecurring = localStorage.getItem(`recurring_transactions_${email}`);
    setRecurringTransactions(savedRecurring ? JSON.parse(savedRecurring) : []);
  };

  // Sync user data back to localStorage (only in Local Mode fallback)
  useEffect(() => {
    if (mounted && user && (!isSupabaseConfigured || !user.id)) {
      localStorage.setItem(`transactions_${user.email}`, JSON.stringify(transactions));
    }
  }, [transactions, user, mounted]);

  // Sync savings goals to localStorage
  useEffect(() => {
    if (mounted && user) {
      localStorage.setItem(`savings_goals_${user.email}`, JSON.stringify(savingsGoals));
    }
  }, [savingsGoals, user, mounted]);

  // Sync recurring transactions to localStorage
  useEffect(() => {
    if (mounted && user) {
      localStorage.setItem(`recurring_transactions_${user.email}`, JSON.stringify(recurringTransactions));
    }
  }, [recurringTransactions, user, mounted]);

  // Load cached AI Advisor advice on mount or user change
  useEffect(() => {
    if (user) {
      const cached = localStorage.getItem(`financial_advice_${user.email || 'guest'}`);
      if (cached) {
        try {
          setAdvisorAdvice(JSON.parse(cached));
        } catch (e) {
          console.error('Error parsing cached advice:', e);
        }
      }
    }
  }, [user]);

  const base64ToBlob = (base64: string) => {
    try {
      const parts = base64.split(';base64,');
      if (parts.length < 2) return null;
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
      console.error('Error converting base64 to blob:', e);
      return null;
    }
  };

  const uploadReceiptToSupabase = async (transactionId: string, base64Str: string, userId: string) => {
    if (!base64Str || !base64Str.startsWith('data:')) {
      return base64Str || '';
    }
    try {
      const blob = base64ToBlob(base64Str);
      if (!blob) return base64Str;
      
      const fileExt = blob.type.split('/')[1] || 'jpeg';
      const fileName = `${userId}/${transactionId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, blob, {
          contentType: blob.type,
          upsert: true
        });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
        
      return urlData?.publicUrl || base64Str;
    } catch (err) {
      console.warn('Failed to upload receipt to Supabase Storage, falling back to Base64:', err);
      return base64Str;
    }
  };

  const fetchFinancialAdvice = async () => {
    setIsAdvisorLoading(true);
    setAdvisorError('');
    try {
      const res = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          budgetLimit,
          totalIncome,
          totalExpense,
          geminiApiKey
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menghasilkan nasihat keuangan.');
      }
      const data = await res.json();
      setAdvisorAdvice(data);
      localStorage.setItem(`financial_advice_${user?.email || 'guest'}`, JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setAdvisorError(err.message || 'Terjadi kesalahan saat menghubungi Gemini AI Advisor.');
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  // Overall statistics (all time)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Filtered transactions (for current month/date & filters)
  const filteredTransactions = transactions
    .filter(t => {
      if (filterDate) return t.date === filterDate;
      return t.date.startsWith(filterMonth);
    })
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => {
      const descMatch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const dateMatch = t.date.toLowerCase().includes(searchQuery.toLowerCase());
      
      let formattedDateMatch = false;
      try {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const formatted = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          formattedDateMatch = formatted.toLowerCase().includes(searchQuery.toLowerCase());
        }
      } catch (e) {
        console.error('Error formatting date for search:', e);
      }
      
      return descMatch || catMatch || dateMatch || formattedDateMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group filtered transactions by date for the grouped layout view
  const groupedTransactions = React.useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredTransactions]);

  // Balance from transactions before current month or date
  const startingBalance = React.useMemo(() => {
    if (filterDate) {
      return transactions
        .filter(t => t.date < filterDate)
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    }
    if (!filterMonth) return 0;
    return transactions
      .filter(t => t.date < `${filterMonth}-01`)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions, filterMonth, filterDate]);

  // Monthly or Daily stats depending on filters
  const monthlyIncome = transactions
    .filter(t => {
      if (filterDate) return t.date === filterDate;
      return t.date.startsWith(filterMonth);
    })
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => {
      if (filterDate) return t.date === filterDate;
      return t.date.startsWith(filterMonth);
    })
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly stats specifically for the budget pace bar
  const monthlyExpenseForBudget = transactions
    .filter(t => t.date.startsWith(filterMonth) && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Savings rate percentage
  const savingsRate = monthlyIncome > 0 
    ? Math.max(0, Math.min(100, ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100))
    : 0;

  // Highest single expense of the month
  const maxExpense = transactions
    .filter(t => t.date.startsWith(filterMonth) && t.type === 'expense')
    .reduce((max, t) => t.amount > max ? t.amount : max, 0);

  // Average transaction value of the month
  const avgTransactionValue = filteredTransactions.length > 0
    ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length
    : 0;

  // Expense grouping by category
  const categorySpending = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => {
        if (filterDate) return t.date === filterDate;
        return t.date.startsWith(filterMonth);
      })
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: monthlyExpense > 0 ? (amount / monthlyExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, filterMonth, monthlyExpense]);

  // Daily balance chart calculations
  const chartData = React.useMemo(() => {
    if (!filterMonth) return [];
    const [yearStr, monthStr] = filterMonth.split('-');
    const year = parseInt(yearStr) || new Date().getFullYear();
    const month = parseInt(monthStr) || (new Date().getMonth() + 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    let cumulative = 0;
    
    return Array.from({ length: daysInMonth }, (_, idx) => {
      const day = idx + 1;
      const dayStr = String(day).padStart(2, '0');
      const targetDateStr = `${filterMonth}-${dayStr}`;
      
      const dayTransactions = transactions.filter(t => t.date === targetDateStr);
      const inc = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const exp = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      cumulative += (inc - exp);
      
      return {
        day,
        dateLabel: `${day} ${new Date(year, month - 1, day).toLocaleDateString('id-ID', { month: 'short' })}`,
        income: inc,
        expense: exp,
        net: inc - exp,
        balance: cumulative,
      };
    });
  }, [transactions, filterMonth]);

  // Chart coordinate mappings
  const chartPathData = React.useMemo(() => {
    if (chartData.length === 0) return { linePath: '', areaPath: '', points: [] };
    const balances = chartData.map(d => d.balance);
    const maxVal = Math.max(...balances, 100000);
    const minVal = Math.min(...balances, -100000);
    const range = maxVal - minVal;
    
    const w = 600;
    const h = 180;
    const paddingLeft = 10;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 15;
    
    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;
    
    const points = chartData.map((d, idx) => {
      const x = paddingLeft + (idx / (chartData.length - 1)) * chartW;
      const y = paddingTop + (1 - (d.balance - minVal) / (range || 1)) * chartH;
      return { x, y, data: d };
    });
    
    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`
      : '';
      
    return { linePath, areaPath, points };
  }, [chartData]);

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress('Menyiapkan pemindai...');
    setScanError('');

    try {
      let parsedData = { amount: 0, description: '', category: 'Lainnya' };
      let base64String = '';

      try {
        setScanProgress('Mengunggah dan memindai dengan AI...');
        
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        base64String = base64;

        const res = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64,
            fileName: file.name,
            veryfiClientId,
            veryfiUsername,
            veryfiApiKey,
            geminiApiKey
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Server-side AI scan failed');
        }

        parsedData = await res.json();
      } catch (aiError) {
        console.warn('AI Scan failed, falling back to local Tesseract OCR:', aiError);
        
        const imageURL = URL.createObjectURL(file);
        setScanProgress('Membaca teks secara lokal (Tesseract)...');
        
        // Also capture base64 for fallback
        if (!base64String) {
          base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        }

        const result = await Tesseract.recognize(
          imageURL,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                setScanProgress(`Local OCR: ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );

        const text = result.data.text;
        if (!text || text.trim().length === 0) {
          throw new Error('Teks tidak terdeteksi dari gambar struk.');
        }

        setScanProgress('Menganalisis teks struk...');
        parsedData = parseReceiptText(text);
      }

      setForm(prev => ({
        ...prev,
        type: 'expense',
        amount: parsedData.amount > 0 ? parsedData.amount.toLocaleString('id-ID') : '',
        description: parsedData.description,
        category: parsedData.category,
        receiptImage: base64String
      }));

      setIsModalOpen(true);
      setIsScanning(false);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Gagal mengenali struk. Coba lagi.');
      setIsScanning(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error during Google login:', err);
      alert('Gagal menghubungkan ke Google Auth. Pastikan proyek Supabase & penyedia Google sudah aktif.');
      setIsAuthLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (isSupabaseConfigured) {
      handleGoogleLogin();
    } else {
      setIsAccountSelectorOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.category || !user) return;

    const amountNum = parseInt(form.amount.replace(/\D/g, ''));

    if (isSupabaseConfigured && user.id) {
      // Database Mode
      let finalData = null;
      const uploadedImageUrl = form.receiptImage ? await uploadReceiptToSupabase(editingId || Date.now().toString(36), form.receiptImage, user.id) : '';

      if (editingId) {
        // Try updating with receipt_image
        const { data, error } = await supabase
          .from('transactions')
          .update({
            type: form.type,
            amount: amountNum,
            description: form.description,
            category: form.category,
            date: form.date,
            receipt_image: uploadedImageUrl || null
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) {
          if (error.code === '42703' || error.code === 'PGRST200') {
            console.warn('receipt_image column missing. Falling back to local storage image cache.');
            const { data: fbData, error: fbError } = await supabase
              .from('transactions')
              .update({
                type: form.type,
                amount: amountNum,
                description: form.description,
                category: form.category,
                date: form.date,
              })
              .eq('id', editingId)
              .select()
              .single();

            if (fbError) {
              console.error('Error updating transaction fallback:', fbError);
              alert('Gagal memperbarui transaksi: ' + fbError.message);
              return;
            }
            finalData = fbData;
          } else {
            console.error('Error updating transaction:', error);
            alert('Gagal memperbarui transaksi: ' + error.message);
            return;
          }
        } else {
          finalData = data;
        }

        if (finalData) {
          if (form.receiptImage) {
            localStorage.setItem(`receipt_image_${editingId}`, form.receiptImage);
          } else {
            localStorage.removeItem(`receipt_image_${editingId}`);
          }
          const updatedTx: Transaction = {
            ...finalData,
            receiptImage: form.receiptImage || undefined
          };
          const updatedList = transactions.map(t => t.id === editingId ? updatedTx : t);
          setTransactions(updatedList);
          localStorage.setItem(`transactions_${user.email}`, JSON.stringify(updatedList));
        }
        setEditingId(null);
      } else {
        // Try inserting with receipt_image
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: form.type,
            amount: amountNum,
            description: form.description,
            category: form.category,
            date: form.date,
            receipt_image: uploadedImageUrl || null
          })
          .select()
          .single();

        if (error) {
          if (error.code === '42703' || error.code === 'PGRST200') {
            console.warn('receipt_image column missing. Falling back to local storage image cache.');
            const { data: fbData, error: fbError } = await supabase
              .from('transactions')
              .insert({
                user_id: user.id,
                type: form.type,
                amount: amountNum,
                description: form.description,
                category: form.category,
                date: form.date,
              })
              .select()
              .single();

            if (fbError) {
              console.error('Error inserting transaction fallback:', fbError);
              alert('Gagal menyimpan transaksi: ' + fbError.message);
              return;
            }
            finalData = fbData;
          } else {
            console.error('Error inserting transaction:', error);
            alert('Gagal menyimpan transaksi: ' + error.message);
            return;
          }
        } else {
          finalData = data;
        }

        if (finalData) {
          if (form.receiptImage) {
            localStorage.setItem(`receipt_image_${finalData.id}`, form.receiptImage);
          }
          const newTx: Transaction = {
            ...finalData,
            receiptImage: form.receiptImage || undefined
          };
          const updatedList = [newTx, ...transactions];
          setTransactions(updatedList);
          localStorage.setItem(`transactions_${user.email}`, JSON.stringify(updatedList));
        }
      }
    } else {
      // Local storage Mode
      const newTransaction: Transaction = {
        id: editingId || Date.now().toString(36),
        type: form.type,
        amount: amountNum,
        description: form.description,
        category: form.category,
        date: form.date,
        receiptImage: form.receiptImage || undefined
      };

      if (form.receiptImage) {
        localStorage.setItem(`receipt_image_${newTransaction.id}`, form.receiptImage);
      } else {
        localStorage.removeItem(`receipt_image_${newTransaction.id}`);
      }

      if (editingId) {
        setTransactions(transactions.map(t => t.id === editingId ? newTransaction : t));
        setEditingId(null);
      } else {
        setTransactions([newTransaction, ...transactions]);
      }
    }

    setIsModalOpen(false);
    setForm({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().slice(0, 10),
      receiptImage: ''
    });
  };

  const handleTypeChangeInForm = (type: 'income' | 'expense') => {
    setForm(prev => ({
      ...prev,
      type,
      category: categories[type].includes(prev.category) ? prev.category : '',
    }));
  };

  const editTransaction = (t: Transaction) => {
    setForm({
      type: t.type,
      amount: t.amount.toString(),
      description: t.description,
      category: t.category,
      date: t.date,
      receiptImage: t.receiptImage || '',
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Yakin hapus transaksi ini?')) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        alert('Gagal menghapus transaksi dari database.');
        return;
      }
    }
    localStorage.removeItem(`receipt_image_${id}`);
    const updatedList = transactions.filter(t => t.id !== id);
    setTransactions(updatedList);
    if (user?.email) {
      localStorage.setItem(`transactions_${user.email}`, JSON.stringify(updatedList));
    }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(budgetInput.replace(/\D/g, '')) || 0;
    setBudgetLimit(val);
    if (user) {
      const storageKey = isSupabaseConfigured && user.id ? user.id : user.email;
      localStorage.setItem(`budget_limit_${storageKey}`, val.toString());
    }
    setIsEditingBudget(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSimulatedGoogleLogin = (email: string, name: string) => {
    setIsAccountSelectorOpen(false);
    setIsAuthLoading(true);
    
    // Simulate slight loading latency for connection
    setTimeout(() => {
      const loggedUser: User = {
        name,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}&radius=50&backgroundColor=059669`
      };
      setUser(loggedUser);
      localStorage.setItem('logged_in_user', JSON.stringify(loggedUser));
      loadLocalUserData(email);
      setIsAuthLoading(false);
    }, 1200);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setTransactions([]);
    setBudgetLimit(5000000);
    setBudgetInput('5000000');
    setIsProfileDropdownOpen(false);
    localStorage.removeItem('logged_in_user');
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah'];
    const rows = transactions.map(t => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.description,
      t.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `catatan-keuangan-${filterDate || filterMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.targetAmount) return;
    
    const targetNum = parseInt(goalForm.targetAmount.replace(/\D/g, '')) || 0;
    const currentNum = parseInt(goalForm.currentAmount.replace(/\D/g, '')) || 0;
    
    const newGoal: SavingsGoal = {
      id: editingGoalId || Date.now().toString(36),
      name: goalForm.name,
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: goalForm.targetDate || undefined
    };
    
    if (editingGoalId) {
      setSavingsGoals(savingsGoals.map(g => g.id === editingGoalId ? newGoal : g));
      setEditingGoalId(null);
    } else {
      setSavingsGoals([...savingsGoals, newGoal]);
    }
    
    setIsGoalModalOpen(false);
    setGoalForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  };

  const deleteGoal = (id: string) => {
    if (!confirm('Hapus target menabung ini?')) return;
    setSavingsGoals(savingsGoals.filter(g => g.id !== id));
  };

  const handleSaveFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !fundsAmountInput) return;
    
    const amountToAdd = parseInt(fundsAmountInput.replace(/\D/g, '')) || 0;
    
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === selectedGoalId) {
        return { ...g, currentAmount: g.currentAmount + amountToAdd };
      }
      return g;
    }));
    
    const targetGoal = savingsGoals.find(g => g.id === selectedGoalId);
    
    if (isDeductFromBalance && targetGoal && user) {
      const description = `Menabung: ${targetGoal.name}`;
      const category = 'Investasi';
      const dateStr = new Date().toISOString().slice(0, 10);
      
      if (isSupabaseConfigured && user.id) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'expense',
            amount: amountToAdd,
            description,
            category,
            date: dateStr
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error inserting saving transaction:', error);
        } else if (data) {
          setTransactions(prev => [data, ...prev]);
        }
      } else {
        const newTransaction: Transaction = {
          id: Date.now().toString(36),
          type: 'expense',
          amount: amountToAdd,
          description,
          category,
          date: dateStr
        };
        setTransactions(prev => [newTransaction, ...prev]);
      }
    }
    
    setIsAddFundsModalOpen(false);
    setSelectedGoalId(null);
    setFundsAmountInput('');
    setIsDeductFromBalance(true);
  };

  const handleSaveRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringForm.description || !recurringForm.amount || !recurringForm.category || !recurringForm.nextDueDate) return;
    
    const amountNum = parseInt(recurringForm.amount.replace(/\D/g, '')) || 0;
    
    const newRecurring: RecurringTransaction = {
      id: editingRecurringId || Date.now().toString(36),
      description: recurringForm.description,
      amount: amountNum,
      category: recurringForm.category,
      type: recurringForm.type,
      frequency: recurringForm.frequency,
      nextDueDate: recurringForm.nextDueDate,
      isActive: recurringForm.isActive
    };
    
    if (editingRecurringId) {
      setRecurringTransactions(recurringTransactions.map(r => r.id === editingRecurringId ? newRecurring : r));
      setEditingRecurringId(null);
    } else {
      setRecurringTransactions([...recurringTransactions, newRecurring]);
    }
    
    setIsRecurringModalOpen(false);
    setRecurringForm({
      description: '',
      amount: '',
      category: '',
      type: 'expense',
      frequency: 'monthly',
      nextDueDate: new Date().toISOString().slice(0, 10),
      isActive: true
    });
  };

  const deleteRecurring = (id: string) => {
    if (!confirm('Hapus transaksi berulang ini?')) return;
    setRecurringTransactions(recurringTransactions.filter(r => r.id !== id));
  };

  const processRecurringDue = async (rec: RecurringTransaction) => {
    if (!user) return;
    
    const dateStr = new Date().toISOString().slice(0, 10);
    
    if (isSupabaseConfigured && user.id) {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: rec.type,
          amount: rec.amount,
          description: `Tagihan: ${rec.description}`,
          category: rec.category,
          date: dateStr
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error inserting recurring transaction:', error);
        alert('Gagal mencatat transaksi tagihan ke database: ' + error.message);
        return;
      } else if (data) {
        setTransactions(prev => [data, ...prev]);
      }
    } else {
      const newTx: Transaction = {
        id: Date.now().toString(36),
        type: rec.type,
        amount: rec.amount,
        description: `Tagihan: ${rec.description}`,
        category: rec.category,
        date: dateStr
      };
      setTransactions(prev => [newTx, ...prev]);
    }
    
    const currentDueDate = new Date(rec.nextDueDate);
    if (rec.frequency === 'monthly') {
      currentDueDate.setMonth(currentDueDate.getMonth() + 1);
    } else {
      currentDueDate.setDate(currentDueDate.getDate() + 7);
    }
    const newDueDateStr = currentDueDate.toISOString().slice(0, 10);
    
    setRecurringTransactions(prev => prev.map(r => {
      if (r.id === rec.id) {
        return { ...r, nextDueDate: newDueDateStr };
      }
      return r;
    }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-400">Memuat lembar kerja...</p>
        </div>
      </div>
    );
  }

  const budgetPercentage = Math.min(100, budgetLimit > 0 ? (monthlyExpenseForBudget / budgetLimit) * 100 : 0);
  const budgetRemaining = budgetLimit - monthlyExpenseForBudget;
  const isBudgetWarning = budgetPercentage >= 90;
  const isBudgetOver = budgetPercentage >= 100;
  const isDark = theme === 'dark';

  // ----------------------------------------------------
  // GUEST / AUTHENTICATION GATE SCREEN
  // ----------------------------------------------------
  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#07070a] text-white' : 'bg-[#f4f4f7] text-zinc-900'} flex flex-col justify-between font-sans relative overflow-hidden transition-colors duration-300`}>
        {/* Glows */}
        <div className={`absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] rounded-full ${isDark ? 'bg-emerald-500/[0.04]' : 'bg-emerald-500/[0.06]'} blur-[160px] pointer-events-none`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full ${isDark ? 'bg-indigo-500/[0.03]' : 'bg-indigo-500/[0.05]'} blur-[140px] pointer-events-none`} />

        {/* Mini Auth Header */}
        <header className="max-w-7xl mx-auto px-6 py-6 w-full flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Wallet className="text-white" size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight">Saku</span>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' 
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'
            }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        {/* Auth Panel Gate */}
        <main className="flex-grow flex items-center justify-center p-6 z-10">
          <div className={`w-full max-w-md border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-zinc-200 shadow-xl'
          }`}>
            
            <div className="text-center mb-8">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Selamat Datang</h2>
              <p className={`text-xs mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Masuk dengan Akun Google/Gmail Anda untuk menyinkronkan data anggaran & transaksi secara aman.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className={`mb-6 p-3.5 border rounded-2xl text-[11px] leading-relaxed flex items-start gap-2.5 ${
                isDark 
                  ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' 
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className="text-lg leading-none">⚠️</span>
                <div>
                  <p className="font-bold mb-0.5">Mode Demonstrasi Aktif</p>
                  <p>Kredensial database Supabase belum terkonfigurasi di berkas `.env.local`. Menggunakan penyimpanan lokal sementara.</p>
                </div>
              </div>
            )}

            {isAuthLoading ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-emerald-500 animate-pulse">Menghubungkan akun Google...</p>
              </div>
            ) : (
              <button
                onClick={handleLoginClick}
                className={`w-full flex items-center justify-center px-4 py-3.5 border rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.99] cursor-pointer ${
                  isDark 
                    ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700' 
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
                }`}
              >
                {/* Official Google Color SVG Logo */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            )}

            <div className={`mt-8 pt-6 border-t flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-semibold ${
              isDark ? 'border-zinc-900/60 text-zinc-500' : 'border-zinc-200 text-zinc-400'
            }`}>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Aman & Terenkripsi Lokal</span>
            </div>
          </div>
        </main>

        <footer className={`py-6 text-center text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Saku &copy; {new Date().getFullYear()}. Seluruh Hak Cipta Dilindungi.
        </footer>

        {/* Google Account Selector Pop-up Simulation */}
        {isAccountSelectorOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-sm rounded-2xl p-6 border transition-all ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pilih Akun Gmail</span>
                <button 
                  onClick={() => setIsAccountSelectorOpen(false)}
                  className={`p-1 rounded-lg border transition-colors ${
                    isDark ? 'border-zinc-800 text-zinc-500 hover:text-white' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2 mt-2">
                {[
                  { email: 'athal@gmail.com', name: 'Athalarta' },
                  { email: 'keuangan.keluarga@gmail.com', name: 'Keuangan Keluarga' },
                  { email: 'tamu@gmail.com', name: 'Tamu Rahasia' }
                ].map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleSimulatedGoogleLogin(acc.email, acc.name)}
                    className={`w-full flex items-center p-3 border rounded-xl text-left transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-900 hover:border-zinc-800 text-zinc-200 hover:text-white' 
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-900'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-500 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">
                      {acc.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight">{acc.name}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight truncate">{acc.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGGED IN DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#07070a] text-white' : 'bg-[#f4f4f7] text-zinc-900'} font-sans relative overflow-hidden antialiased pb-24 lg:pb-8 transition-colors duration-300`}>
      <div className="no-print">
        {/* Glows */}
      <div className={`absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] rounded-full ${isDark ? 'bg-emerald-500/[0.03]' : 'bg-emerald-500/[0.05]'} blur-[160px] pointer-events-none`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full ${isDark ? 'bg-indigo-500/[0.02]' : 'bg-indigo-500/[0.04]'} blur-[140px] pointer-events-none`} />

      {/* Navigation Header */}
      <header className={`border-b ${isDark ? 'border-zinc-900/60 bg-zinc-950/50' : 'border-zinc-200/80 bg-white/70'} backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300 no-print`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 flex-shrink-0">
              <Wallet className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">Saku</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDark 
                  ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' 
                  : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'
              }`}
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="relative hidden sm:flex items-center gap-3">
              {/* Month Picker */}
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className={`border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 focus:border-emerald-500' 
                      : 'bg-white border-zinc-200 text-zinc-800 focus:border-emerald-500 shadow-sm'
                  }`}
                />
              </div>
              {/* Date Picker */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className={`border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer transition-all ${
                      isDark 
                        ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 focus:border-emerald-500' 
                        : 'bg-white border-zinc-200 text-zinc-800 focus:border-emerald-500 shadow-sm'
                    }`}
                    title="Filter Tanggal Spesifik"
                  />
                </div>
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className={`px-2.5 py-1.5 border rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                      isDark 
                        ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' 
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-650 hover:text-zinc-900 shadow-sm'
                    }`}
                    title="Hapus Filter Tanggal"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Scan Receipt Button */}
            <div className="relative">
              <label
                htmlFor="desktop-receipt-upload"
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] ${
                  isDark 
                    ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' 
                    : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
                }`}
                title="Pindai Struk Belanja (AI)"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Scan Struk</span>
              </label>
              <input
                type="file"
                id="desktop-receipt-upload"
                accept="image/*"
                onChange={handleReceiptScan}
                className="hidden"
              />
            </div>

            {/* PDF Export Button */}
            <button
              onClick={() => window.print()}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] no-print ${
                isDark 
                  ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' 
                  : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
              }`}
              title="Cetak PDF / Laporan Bulanan"
            >
              <Download size={14} className="text-emerald-500" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>

            {/* Tambah Transaksi Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-emerald-950/10 active:scale-[0.98] transition-all"
              title="Tambah Transaksi Manual"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Transaksi</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 border rounded-xl transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:text-white' 
                    : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
                }`}
              >
                {/* User avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=Athal'} 
                  alt={user.name} 
                  className="w-5 h-5 rounded-full border border-emerald-500/20"
                />
                <span className="text-xs font-semibold max-w-[80px] truncate hidden md:inline">{user.name}</span>
              </button>

              {isProfileDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl p-2 border z-50 shadow-2xl transition-all ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                }`}>
                  <div className="p-3 border-b border-zinc-900/60 text-xs">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-zinc-500 mt-0.5 truncate flex items-center gap-1">
                      <Mail size={12} />
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-3 mt-1 hover:bg-rose-500/10 text-rose-500 rounded-xl text-left text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 lg:py-8">
        {/* Due Bills Reminder Banner */}
        {(() => {
          const todayStr = new Date().toISOString().slice(0, 10);
          const dueBills = recurringTransactions.filter(r => r.isActive && r.nextDueDate <= todayStr);
          if (dueBills.length === 0) return null;
          
          return (
            <div className={`mb-6 p-4 border rounded-3xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print ${
              isDark 
                ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' 
                : 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
            }`}>
              <div className="flex gap-3 items-start">
                <span className="text-xl">📅</span>
                <div>
                  <h4 className="text-sm font-bold">Tagihan Jatuh Tempo</h4>
                  <p className="text-xs mt-0.5 opacity-90 font-medium">Ada {dueBills.length} tagihan rutin yang perlu dicatat.</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {dueBills.map(bill => (
                  <div key={bill.id} className={`flex items-center justify-between gap-4 p-2.5 rounded-xl border text-xs w-full md:w-auto ${
                    isDark ? 'bg-zinc-950/80 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                    <div className="text-left">
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{bill.description}</p>
                      <p className="text-[10px] text-zinc-500">{formatRupiah(bill.amount)} • Tempo: {bill.nextDueDate}</p>
                    </div>
                    <button
                      onClick={() => processRecurringDue(bill)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow transition-all active:scale-95"
                    >
                      Bayar / Catat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Month & Date Selector for Mobile */}
        <div className="block sm:hidden mb-4 space-y-2">
          <div className="flex gap-2">
            {/* Mobile Month Input */}
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer transition-all ${
                  isDark 
                    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 focus:border-emerald-500' 
                    : 'bg-white border-zinc-200 text-zinc-800 focus:border-emerald-500 shadow-sm'
                }`}
              />
            </div>
            {/* Mobile Date Input */}
            <div className="relative flex-1 flex gap-1.5 items-center">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200 focus:border-emerald-500' 
                      : 'bg-white border-zinc-200 text-zinc-800 focus:border-emerald-500 shadow-sm'
                  }`}
                />
              </div>
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className={`px-3 py-2.5 border rounded-xl transition-all cursor-pointer text-xs font-semibold ${
                    isDark 
                      ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400' 
                      : 'bg-white border-zinc-200 text-zinc-650 shadow-sm'
                  }`}
                >
                  X
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            TAB 1: OVERVIEW / RINGKASAN (MOBILE ACTIVE TABS)
            ---------------------------------------------------- */}
        <div className={mobileTab === 'overview' ? 'block space-y-6 lg:block' : 'hidden lg:block space-y-6'}>
          {/* Core Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Balance Card */}
            <div className={`backdrop-blur-xl border rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-zinc-900/60 to-emerald-950/15 border-zinc-800/80 hover:border-emerald-500/20' 
                : 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100 shadow-sm hover:border-emerald-300/40'
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Saldo Saat Ini</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  <Wallet size={16} />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${
                balance >= 0 
                  ? (isDark ? 'text-white' : 'text-zinc-900') 
                  : (isDark ? 'text-rose-400' : 'text-rose-600')
              }`}>
                {formatRupiah(balance)}
              </p>
              <div className={`mt-4 flex items-center gap-1.5 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <Info size={12} className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                <span>Pemasukan dikurangi pengeluaran</span>
              </div>
            </div>

            {/* Income Summary Card */}
            <div className={`backdrop-blur-xl border rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/60' 
                : 'bg-white/80 border-zinc-200/80 hover:border-zinc-300/60 shadow-sm'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Pemasukan</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {formatRupiah(totalIncome)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500">
                <span className="text-emerald-500 font-medium">{filterDate ? 'Hari ini:' : 'Bulan ini:'}</span>
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{formatRupiah(monthlyIncome)}</span>
              </div>
            </div>

            {/* Expense Summary Card */}
            <div className={`backdrop-blur-xl border rounded-3xl p-6 relative overflow-hidden group transition-all duration-300 ${
              isDark 
                ? 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/60' 
                : 'bg-white/80 border-zinc-200/80 hover:border-zinc-300/60 shadow-sm'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Pengeluaran</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <ArrowDownLeft size={16} />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {formatRupiah(totalExpense)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500">
                <span className="text-rose-500 font-medium">{filterDate ? 'Hari ini:' : 'Bulan ini:'}</span>
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{formatRupiah(monthlyExpense)}</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Chart Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 relative ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Tren Akumulasi Saldo</h3>
                <p className="text-xs text-zinc-500">Aliran saldo bersih sepanjang hari dalam sebulan</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Saldo Kumulatif</span>
              </div>
            </div>

            {/* Chart Core Render */}
            <div className={`relative h-[200px] w-full rounded-2xl border overflow-visible ${
              isDark ? 'bg-zinc-950/20 border-zinc-900/60' : 'bg-zinc-50/50 border-zinc-200/60'
            }`}>
              {chartData.length === 0 || chartData.every(d => d.balance === 0) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                  <TrendingUp className="text-zinc-400 mb-2" size={32} />
                  <span className="text-sm">Belum ada aktivitas finansial di bulan ini</span>
                </div>
              ) : (
                <>
                  <svg 
                    viewBox="0 0 600 180" 
                    className="w-full h-full overflow-visible"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const svgW = rect.width;
                      const pct = Math.max(0, Math.min(1, x / svgW));
                      const idx = Math.round(pct * (chartData.length - 1));
                      if (idx >= 0 && idx < chartData.length) {
                        setHoveredPointIdx(idx);
                      }
                    }}
                    onMouseLeave={() => setHoveredPointIdx(null)}
                  >
                    <defs>
                      <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Helper Gridlines */}
                    <line x1="0" y1="45" x2="600" y2="45" stroke={isDark ? '#18181b' : '#e4e4e7'} strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke={isDark ? '#18181b' : '#e4e4e7'} strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="135" x2="600" y2="135" stroke={isDark ? '#18181b' : '#e4e4e7'} strokeWidth="1" strokeDasharray="4 4" />

                    {/* Area Under Line */}
                    {chartPathData.areaPath && (
                      <path d={chartPathData.areaPath} fill="url(#glowGradient)" />
                    )}

                    {/* Chart Core Line */}
                    {chartPathData.linePath && (
                      <path 
                        d={chartPathData.linePath} 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    )}

                    {/* Dynamic Interaction Overlay Point */}
                    {hoveredPointIdx !== null && chartPathData.points[hoveredPointIdx] && (
                      <>
                        <line 
                          x1={chartPathData.points[hoveredPointIdx].x} 
                          y1="0" 
                          x2={chartPathData.points[hoveredPointIdx].x} 
                          y2="180" 
                          stroke={isDark ? '#3f3f46' : '#d4d4d8'} 
                          strokeWidth="1" 
                        />
                        <circle 
                          cx={chartPathData.points[hoveredPointIdx].x} 
                          cy={chartPathData.points[hoveredPointIdx].y} 
                          r="6" 
                          fill="#059669" 
                        />
                        <circle 
                          cx={chartPathData.points[hoveredPointIdx].x} 
                          cy={chartPathData.points[hoveredPointIdx].y} 
                          r="3" 
                          fill="#ffffff" 
                        />
                      </>
                    )}
                  </svg>

                  {/* Dynamic Floating Tooltip */}
                  {hoveredPointIdx !== null && chartData[hoveredPointIdx] && (
                    <div 
                      className={`absolute border rounded-xl p-3 shadow-2xl pointer-events-none backdrop-blur-md transition-all duration-75 text-xs z-10 ${
                        isDark ? 'bg-zinc-950/95 border-zinc-800 text-zinc-300' : 'bg-white/95 border-zinc-200 text-zinc-800 shadow-xl'
                      }`}
                      style={{
                        left: `${Math.min(85, Math.max(15, (hoveredPointIdx / (chartData.length - 1)) * 100))}%`,
                        bottom: '20px',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <p className={`font-semibold mb-1 border-b pb-1 flex justify-between gap-4 ${isDark ? 'border-zinc-900 text-zinc-400' : 'border-zinc-200 text-zinc-500'}`}>
                        <span>{chartData[hoveredPointIdx].dateLabel}</span>
                        <span className="text-zinc-500">Day {chartData[hoveredPointIdx].day}</span>
                      </p>
                      <div className="space-y-1">
                        <p className="flex justify-between gap-4">
                          <span>Saldo:</span>
                          <span className={`font-bold ${
                            chartData[hoveredPointIdx].balance >= 0 
                              ? (isDark ? 'text-white' : 'text-zinc-900') 
                              : (isDark ? 'text-rose-400' : 'text-rose-600')
                          }`}>
                            {formatRupiah(chartData[hoveredPointIdx].balance)}
                          </span>
                        </p>
                        {(chartData[hoveredPointIdx].income > 0 || chartData[hoveredPointIdx].expense > 0) && (
                          <div className={`pt-1 mt-1 border-t text-[10px] space-y-0.5 ${isDark ? 'border-zinc-900/60 text-zinc-500' : 'border-zinc-200 text-zinc-400'}`}>
                            {chartData[hoveredPointIdx].income > 0 && (
                              <p className="text-emerald-500">Pemasukan: +{formatRupiah(chartData[hoveredPointIdx].income)}</p>
                            )}
                            {chartData[hoveredPointIdx].expense > 0 && (
                              <p className="text-rose-500">Pengeluaran: -{formatRupiah(chartData[hoveredPointIdx].expense)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
          {/* ----------------------------------------------------
              TAB 2: TRANSACTIONS / TRANSAKSI (MOBILE ACTIVE TABS)
              ---------------------------------------------------- */}
          <div className={`${mobileTab === 'transactions' ? 'block' : 'hidden'} lg:block lg:col-span-8 print:block print:col-span-12`}>
          {/* Transactions List Area */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            
            {/* Header Filters & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Riwayat Transaksi</h3>
                <p className="text-xs text-zinc-500">Total {filteredTransactions.length} transaksi ditemukan pada lembar ini</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className={`relative w-full md:w-48 border rounded-xl focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all ${
                  isDark ? 'bg-zinc-950/80 border-zinc-900 focus-within:border-emerald-500/60' : 'bg-white border-zinc-200 focus-within:border-emerald-500/60 shadow-sm'
                }`}>
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="text-zinc-500" size={16} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari transaksi..."
                    className={`w-full bg-transparent pl-9 pr-8 py-2 text-sm focus:outline-none ${
                      isDark ? 'text-zinc-300 placeholder-zinc-500' : 'text-zinc-800 placeholder-zinc-400'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-900"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Dedicated Date Picker Filter */}
                <div className="flex items-center gap-1.5 flex-1 min-w-[130px] sm:flex-initial">
                  <div className="relative flex-1 flex items-center">
                    <span className="absolute left-2.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer transition-all ${
                        isDark 
                          ? 'bg-zinc-950/85 border-zinc-900 text-zinc-355 focus:border-emerald-500' 
                          : 'bg-white border-zinc-200 text-zinc-755 focus:border-emerald-500 shadow-sm'
                      }`}
                      title="Filter Tanggal Spesifik"
                    />
                  </div>
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className={`px-2.5 py-1.5 border rounded-xl transition-all cursor-pointer text-[10px] font-bold ${
                        isDark 
                          ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-450 hover:text-white' 
                          : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'
                      }`}
                      title="Hapus Filter Tanggal"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Exporter */}
                <button
                  onClick={exportToCSV}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' 
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:text-zinc-900 shadow-sm'
                  }`}
                  title="Ekspor CSV"
                >
                  <Download size={14} />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Segmented Controls for Category Type Filter */}
            <div className={`flex border rounded-xl p-1 mb-6 max-w-sm ${
              isDark ? 'bg-zinc-950/80 border-zinc-900' : 'bg-zinc-100 border-zinc-200'
            }`}>
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    filterType === type 
                      ? (isDark ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm' : 'bg-white text-zinc-900 border border-zinc-200/80 shadow-sm') 
                      : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-800')
                  }`}
                >
                  {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
              ))}
            </div>

            {/* Gemini AI Advisor Quick Banner */}
            <div className={`mb-6 p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/15' 
                : 'bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border-emerald-250/60 shadow-xs'
            }`}>
              <div className="flex gap-2.5 items-start">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  <Sparkles size={14} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Analisis Keuangan Gemini AI</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Ketahui kesehatan keuangan Anda dan tips hemat instan dari AI.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileTab('analysis');
                  fetchFinancialAdvice();
                }}
                className="w-full sm:w-auto px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-450 hover:to-emerald-550 text-white rounded-lg font-bold text-[10px] tracking-wide cursor-pointer shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1"
              >
                <Sparkles size={11} />
                <span>Analisis Sekarang</span>
              </button>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className={`py-16 text-center rounded-2xl border border-dashed ${
                isDark ? 'text-zinc-600 bg-zinc-950/10 border-zinc-900' : 'text-zinc-400 bg-zinc-50/50 border-zinc-200'
              }`}>
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-sm font-medium">Tidak ada transaksi yang cocok</p>
                <p className="text-xs text-zinc-500 mt-1">Coba ubah filter bulan atau cari kata kunci lain</p>
              </div>
            ) : (
              <div className="space-y-6 pb-16">
                {groupedTransactions.map(([dateStr, items]) => {
                  return (
                    <div key={dateStr} className="space-y-2.5">
                      {/* Date Header */}
                      <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
                        <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {(() => {
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(today.getDate() - 1);
                            
                            const todayStr = today.toISOString().slice(0, 10);
                            const yesterdayStr = yesterday.toISOString().slice(0, 10);
                            
                            if (dateStr === todayStr) {
                              return 'Hari Ini';
                            } else if (dateStr === yesterdayStr) {
                              return 'Kemarin';
                            } else {
                              return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                            }
                          })()}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] font-semibold ${isDark ? 'text-zinc-650' : 'text-zinc-400'}`}>
                          {items.length} Transaksi
                        </span>
                      </div>

                      {/* Transaction Cards for this Date */}
                      <div className="space-y-2">
                        {items.map((t) => {
                          const meta = categoryMetadata[t.category] || { icon: Tag, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', lightColor: 'text-zinc-650', lightBgColor: 'bg-zinc-100' };
                          return (
                            <div 
                              key={t.id} 
                              onClick={() => setSelectedTransactionForDetails(t)}
                              className={`group border rounded-2xl px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-all duration-300 ${
                                isDark 
                                  ? 'bg-zinc-900/20 hover:bg-zinc-900/40 border-zinc-900/60 hover:border-zinc-800/80' 
                                  : 'bg-white hover:bg-zinc-50/80 border-zinc-200/80 hover:border-zinc-300 shadow-sm'
                              }`}
                            >
                              {/* Transaction Icon & Text Description */}
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                {/* Category Emoji Badge */}
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                  isDark ? 'border-zinc-800/50' : 'border-zinc-200/60'
                                } ${isDark ? meta.bgColor : meta.lightBgColor}`}>
                                  {React.createElement(meta.icon, {
                                    className: `w-5 h-5 ${isDark ? meta.color : meta.lightColor}`
                                  })}
                                </div>
                                
                                <div className="min-w-0">
                                  <p className={`font-semibold text-xs sm:text-sm truncate transition-colors ${
                                    isDark ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-800 group-hover:text-zinc-900'
                                  }`}>
                                    {t.description}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-500 mt-0.5">
                                    <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.category}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Amount & Quick Actions */}
                              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                {t.receiptImage && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveReceiptImage(t.receiptImage || null);
                                    }}
                                    className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center justify-center shadow-sm active:scale-95"
                                    title="Lihat Struk"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </button>
                                )}
                                <p className={`font-bold text-xs sm:text-sm tracking-tight text-right ${
                                  t.type === 'income' ? 'text-emerald-500' : (isDark ? 'text-zinc-300' : 'text-zinc-700')
                                }`}>
                                  {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                                </p>

                                {/* Quick Actions Panel - always visible on mobile, hover-only on desktop */}
                                <div className={`flex items-center border-l pl-2 gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 ${
                                  isDark ? 'border-zinc-900' : 'border-zinc-200'
                                }`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      editTransaction(t);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                                    }`}
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTransaction(t.id);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      isDark ? 'hover:bg-zinc-800 text-zinc-505 hover:text-rose-400' : 'hover:bg-zinc-100 text-zinc-505 hover:text-rose-600'
                                    }`}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

          {/* ----------------------------------------------------
              TAB 3: ANALYTICS / ANALISIS (MOBILE ACTIVE TABS)
              ---------------------------------------------------- */}
          <div className={`${mobileTab === 'analysis' ? 'block' : 'hidden'} lg:block lg:col-span-4 space-y-6 print:block print:col-span-12`}>
          {/* Monthly Budget Pacing Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 relative ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>Anggaran Bulanan</h3>
              
              {isEditingBudget ? (
                <button 
                  onClick={() => setIsEditingBudget(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Batal
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setBudgetInput(budgetLimit.toString());
                    setIsEditingBudget(true);
                  }}
                  className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer"
                >
                  Ubah Batas
                </button>
              )}
            </div>

            {isEditingBudget ? (
              <form onSubmit={handleSaveBudget} className="mt-3 space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 text-xs font-semibold">Rp</span>
                  <input
                    type="text"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value.replace(/\D/g, ''))}
                    className={`w-full border rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none ${
                      isDark 
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-300 focus:border-emerald-500' 
                        : 'bg-white border-zinc-200 text-zinc-800 focus:border-emerald-500 shadow-sm'
                    }`}
                    placeholder="Contoh: 5000000"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Simpan Batas
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{formatRupiah(monthlyExpense)}</p>
                  <p className="text-xs text-zinc-500">dari {formatRupiah(budgetLimit)}</p>
                </div>

                {/* Progress Indicator */}
                <div className={`w-full h-2.5 rounded-full overflow-hidden border ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-100 border-zinc-200/80'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBudgetOver 
                        ? 'bg-rose-500' 
                        : isBudgetWarning 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${budgetPercentage}%` }}
                  />
                </div>

                {/* Alert Indicators */}
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-500">{budgetPercentage.toFixed(0)}% terpakai</span>
                  {isBudgetOver ? (
                    <span className="text-rose-500 flex items-center gap-1 font-semibold">⚠️ Defisit {formatRupiah(Math.abs(budgetRemaining))}</span>
                  ) : (
                    <span className={isDark ? 'text-zinc-400' : 'text-zinc-700'}>Sisa {formatRupiah(budgetRemaining)}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Target Menabung (Savings Goals) Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 relative no-print ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>Target Menabung</h3>
              <button 
                onClick={() => {
                  setEditingGoalId(null);
                  setGoalForm({ name: '', targetAmount: '', currentAmount: '0', targetDate: '' });
                  setIsGoalModalOpen(true);
                }}
                className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer font-bold"
              >
                + Target
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                Belum ada target menabung. Mulai menabung sekarang!
              </div>
            ) : (
              <div className="space-y-4">
                {savingsGoals.map((g) => {
                  const pct = Math.min(100, g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0);
                  const isCompleted = pct >= 100;
                  return (
                    <div key={g.id} className={`p-3 border rounded-2xl space-y-2 group transition-all duration-300 ${
                      isDark ? 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200/80 hover:border-zinc-300'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 text-left">
                          <p className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{g.name}</p>
                          {g.targetDate && (
                            <p className="text-[10px] text-zinc-500">Target: {new Date(g.targetDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingGoalId(g.id);
                              setGoalForm({
                                name: g.name,
                                targetAmount: g.targetAmount.toString(),
                                currentAmount: g.currentAmount.toString(),
                                targetDate: g.targetDate || ''
                              });
                              setIsGoalModalOpen(true);
                            }}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-650'}`}
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => deleteGoal(g.id)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'hover:bg-zinc-800 text-zinc-550 hover:text-rose-450' : 'hover:bg-zinc-200 text-zinc-550 hover:text-rose-600'}`}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between text-[11px] font-medium">
                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-700'}>{formatRupiah(g.currentAmount)}</span>
                        <span className="text-[10px] text-zinc-500">dari {formatRupiah(g.targetAmount)}</span>
                      </div>

                      <div className={`w-full h-1.5 rounded-full overflow-hidden border ${isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-150 border-zinc-200'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-teal-500'}`} 
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-500' : 'text-zinc-550'}`}>
                          {isCompleted ? 'Tercapai! 🎉' : `${pct.toFixed(0)}% selesai`}
                        </span>
                        
                        <button
                          onClick={() => {
                            setSelectedGoalId(g.id);
                            setFundsAmountInput('');
                            setIsDeductFromBalance(true);
                            setIsAddFundsModalOpen(true);
                          }}
                          className="px-2 py-0.5 border rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          + Tabung
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transaksi Berulang (Recurring Bills) Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 relative no-print ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>Transaksi Rutin</h3>
              <button 
                onClick={() => {
                  setEditingRecurringId(null);
                  setRecurringForm({
                    description: '',
                    amount: '',
                    category: '',
                    type: 'expense',
                    frequency: 'monthly',
                    nextDueDate: new Date().toISOString().slice(0, 10),
                    isActive: true
                  });
                  setIsRecurringModalOpen(true);
                }}
                className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer font-bold"
              >
                + Rutin
              </button>
            </div>

            {recurringTransactions.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                Belum ada transaksi rutin terdaftar.
              </div>
            ) : (
              <div className="space-y-3">
                {recurringTransactions.map((r) => (
                  <div key={r.id} className={`p-3 border rounded-2xl flex items-center justify-between gap-3 group transition-all duration-300 ${
                    isDark ? 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200/80 hover:border-zinc-300'
                  }`}>
                    <div className="min-w-0 text-left">
                      <p className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{r.description}</p>
                      <p className="text-[10px] text-zinc-500">{formatRupiah(r.amount)} • {r.frequency === 'monthly' ? 'Bulanan' : 'Mingguan'}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Jatuh tempo: {r.nextDueDate}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          setRecurringTransactions(prev => prev.map(item => item.id === r.id ? { ...item, isActive: !item.isActive } : item));
                        }}
                        className={`w-7 h-4 rounded-full transition-all relative border flex items-center p-0.5 cursor-pointer ${
                          r.isActive 
                            ? 'bg-emerald-500/20 border-emerald-500/30' 
                            : (isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-200 border-zinc-300')
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                          r.isActive 
                            ? 'bg-emerald-550 translate-x-3' 
                            : 'bg-zinc-500 translate-x-0'
                        }`} />
                      </button>

                      <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingRecurringId(r.id);
                            setRecurringForm({
                              description: r.description,
                              amount: r.amount.toString(),
                              category: r.category,
                              type: r.type,
                              frequency: r.frequency,
                              nextDueDate: r.nextDueDate,
                              isActive: r.isActive
                            });
                            setIsRecurringModalOpen(true);
                          }}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-650'}`}
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => deleteRecurring(r.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'hover:bg-zinc-800 text-zinc-550 hover:text-rose-450' : 'hover:bg-zinc-200 text-zinc-500 hover:text-rose-600'}`}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Allocation breakdown */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-5 ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>Distribusi Pengeluaran</h3>
            
            {categorySpending.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                Belum ada catatan pengeluaran bulan ini
              </div>
            ) : (
              <div className="space-y-6">
                {/* SVG Donut Chart Section */}
                <div className="flex justify-center py-2 no-print">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                      {(() => {
                        const donutRadius = 50;
                        const donutCircumference = 2 * Math.PI * donutRadius; // ~314.159
                        let runningPct = 0;
                        return categorySpending.map((c, idx) => {
                          const meta = categoryMetadata[c.name] || { color: 'text-zinc-400', strokeColor: 'stroke-zinc-400' };
                          const strokeClass = meta.strokeColor || 'stroke-zinc-400';
                          const segmentLength = (c.percentage / 100) * donutCircumference;
                          const startAngle = (runningPct / 100) * 360 - 90;
                          
                          runningPct += c.percentage;
                          
                          return (
                            <circle
                              key={c.name}
                              cx="100"
                              cy="100"
                              r={donutRadius}
                              fill="transparent"
                              className={`transition-all duration-300 cursor-pointer ${strokeClass} origin-center`}
                              style={{
                                strokeWidth: hoveredDonutIdx === idx ? 15 : 10,
                                strokeDasharray: `${segmentLength} ${donutCircumference}`,
                                strokeDashoffset: 0,
                                transform: `rotate(${startAngle}deg)`,
                                strokeLinecap: 'butt'
                              }}
                              onMouseEnter={() => setHoveredDonutIdx(idx)}
                              onMouseLeave={() => setHoveredDonutIdx(null)}
                            />
                          );
                        });
                      })()}
                      {/* Hover/Selection text in center */}
                      <g className="pointer-events-none">
                        <circle cx="100" cy="100" r="42" className={isDark ? 'fill-zinc-950/90' : 'fill-white/95'} />
                        <text x="100" y="92" textAnchor="middle" className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'fill-zinc-500' : 'fill-zinc-400'}`}>
                          {hoveredDonutIdx !== null ? categorySpending[hoveredDonutIdx].name : 'Total Belanja'}
                        </text>
                        <text x="100" y="112" textAnchor="middle" className={`text-sm font-extrabold tracking-tight ${isDark ? 'fill-white' : 'fill-zinc-900'}`}>
                          {formatRupiah(hoveredDonutIdx !== null ? categorySpending[hoveredDonutIdx].amount : monthlyExpense)}
                        </text>
                        {hoveredDonutIdx !== null ? (
                          <text x="100" y="128" textAnchor="middle" className="text-[9px] font-bold fill-emerald-500">
                            {categorySpending[hoveredDonutIdx].percentage.toFixed(0)}% dari total
                          </text>
                        ) : (
                          <text x="100" y="128" textAnchor="middle" className={`text-[9px] font-semibold ${isDark ? 'fill-zinc-650' : 'fill-zinc-400'}`}>
                            {categorySpending.length} Kategori
                          </text>
                        )}
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Progress bar list of categories */}
                <div className="space-y-4">
                {categorySpending.slice(0, 5).map((c) => {
                  const meta = categoryMetadata[c.name] || { icon: Tag, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', lightColor: 'text-zinc-650', lightBgColor: 'bg-zinc-100' };
                  return (
                    <div key={c.name} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <span className={isDark ? meta.color : meta.lightColor}>
                            {React.createElement(meta.icon, { className: "w-3.5 h-3.5" })}
                          </span>
                          <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{c.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{formatRupiah(c.amount)}</span>
                          <span className="text-zinc-500 ml-1.5 text-[10px]">{c.percentage.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className={`w-full h-1.5 rounded-full overflow-hidden border ${isDark ? 'bg-zinc-950 border-zinc-900/60' : 'bg-zinc-100 border-zinc-200/60'}`}>
                        <div 
                          className={`h-full rounded-full ${isDark ? meta.color.replace('text-', 'bg-') : meta.lightColor.replace('text-', 'bg-')}`} 
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {categorySpending.length > 5 && (
                  <p className={`text-center text-[10px] pt-2 border-t ${isDark ? 'text-zinc-500 border-zinc-900' : 'text-zinc-400 border-zinc-100'}`}>
                    +{categorySpending.length - 5} Kategori pengeluaran lainnya
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

          {/* Financial Insights */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 space-y-4 ${
            isDark ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white/80 border-zinc-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>Metrik Finansial</h3>
            
            <div className={`divide-y ${isDark ? 'divide-zinc-900' : 'divide-zinc-100'}`}>
              {/* Savings Rate metric */}
              <div className="pb-3 flex justify-between items-center text-xs">
                <div>
                  <p className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Rasio Menabung</p>
                  <p className="text-[10px] text-zinc-500">Sisa simpanan dari pemasukan</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  savingsRate >= 40 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : savingsRate >= 20 
                      ? 'bg-teal-500/10 text-teal-600' 
                      : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500')
                }`}>
                  {savingsRate.toFixed(0)}%
                </span>
              </div>

              {/* Highest single transaction */}
              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Pengeluaran Terbesar</p>
                  <p className="text-[10px] text-zinc-500">Item paling mahal bulan ini</p>
                </div>
                <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {formatRupiah(maxExpense)}
                </span>
              </div>

              {/* Average transaction values */}
              <div className="pt-3 flex justify-between items-center text-xs">
                <div>
                  <p className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Rata-rata Transaksi</p>
                  <p className="text-[10px] text-zinc-500">Nilai tengah keseluruhan transaksi</p>
                </div>
                <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {formatRupiah(avgTransactionValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Gemini Advisor Card */}
          <div className={`backdrop-blur-xl border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${
            isDark 
              ? 'bg-zinc-900/30 border-zinc-900 hover:border-emerald-500/25' 
              : 'bg-white/80 border-zinc-200 shadow-sm hover:border-emerald-500/25'
          }`}>
            {/* Ambient Background Glow when AI is active */}
            {advisorAdvice && (
              <div className="absolute -right-24 -top-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="flex items-center gap-2.5 mb-5 relative z-10">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <Sparkles size={16} className={isAdvisorLoading ? 'animate-spin' : ''} />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Gemini Advisor</h3>
                <p className="text-[10px] text-zinc-500">Konsultasi Keuangan Berbasis AI</p>
              </div>
            </div>

            {isAdvisorLoading ? (
              <div className="space-y-4 py-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-center text-xs text-zinc-500 animate-pulse font-medium">
                  Gemini sedang menganalisis pola transaksi Anda...
                </p>
                <div className="space-y-2.5">
                  <div className={`h-8 rounded-xl animate-pulse ${isDark ? 'bg-zinc-950/60' : 'bg-zinc-100'}`} />
                  <div className={`h-16 rounded-xl animate-pulse ${isDark ? 'bg-zinc-950/60' : 'bg-zinc-100'}`} />
                </div>
              </div>
            ) : advisorError ? (
              <div className="space-y-3 py-1">
                <p className="text-xs text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  {advisorError}
                </p>
                <button
                  onClick={fetchFinancialAdvice}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Coba Lagi
                </button>
              </div>
            ) : advisorAdvice ? (
              <div className="space-y-4 relative z-10">
                {/* Score & Summary */}
                <div className="flex items-center gap-4 bg-zinc-500/5 p-3.5 rounded-2xl border border-zinc-500/10">
                  <div className="flex-shrink-0 relative w-16 h-16 flex items-center justify-center">
                    {/* Ring score */}
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-500/10" />
                    <div className={`absolute inset-0 rounded-full border-4 ${
                      advisorAdvice.score >= 80 
                        ? 'border-emerald-500' 
                        : advisorAdvice.score >= 60 
                          ? 'border-amber-500' 
                          : 'border-rose-500'
                    }`} style={{
                      clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`
                    }} />
                    <span className="text-base font-extrabold tracking-tight">{advisorAdvice.score}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      advisorAdvice.score >= 80 
                        ? 'text-emerald-500' 
                        : advisorAdvice.score >= 60 
                          ? 'text-amber-500' 
                          : 'text-rose-500'
                    }`}>
                      Kesehatan Keuangan
                    </p>
                    <p className={`text-xs leading-relaxed mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {advisorAdvice.summary}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Tips & Strategi AI:</p>
                  {advisorAdvice.tips.map((tip, idx) => (
                    <div 
                      key={idx}
                      className={`flex gap-3 p-3 rounded-xl border text-xs leading-relaxed ${
                        isDark ? 'bg-zinc-950/40 border-zinc-900/60 text-zinc-300' : 'bg-zinc-50 border-zinc-150 text-zinc-700'
                      }`}
                    >
                      <span className="flex-shrink-0 text-base">
                        {idx === 0 ? '💡' : idx === 1 ? '🎯' : '📈'}
                      </span>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={fetchFinancialAdvice}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isDark 
                      ? 'border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-300' 
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  Minta Analisis Ulang
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-1 text-center">
                <p className="text-xs text-zinc-500 leading-relaxed px-1">
                  Minta asisten Gemini AI menganalisis data pengeluaran dan rasio menabung Anda untuk rekomendasi optimal.
                </p>
                <button
                  onClick={fetchFinancialAdvice}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Sparkles size={13} />
                  <span>Analisis Pengeluaran Saya</span>
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

      </main>

      {/* Floating Action Button (FAB) on Mobile - visible under the Tab 2: Transactions only */}
      {mobileTab === 'transactions' && (
        <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40 lg:hidden no-print">
          {/* Scan Struk Camera FAB */}
          <label
            htmlFor="mobile-receipt-upload"
            className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer"
            title="Scan Struk"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
          <input
            type="file"
            id="mobile-receipt-upload"
            accept="image/*"
            onChange={handleReceiptScan}
            className="hidden"
          />

          {/* Plus Manual Input FAB */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) on Mobile - visible under the Tab 3: Analysis only */}
      {mobileTab === 'analysis' && (
        <div className="fixed bottom-24 right-6 z-40 lg:hidden no-print">
          <button
            onClick={fetchFinancialAdvice}
            disabled={isAdvisorLoading}
            className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Analisis Keuangan AI"
          >
            <Sparkles size={20} className={isAdvisorLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* ----------------------------------------------------
          MOBILE BOTTOM TAB NAVIGATION BAR
          ---------------------------------------------------- */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg lg:hidden transition-colors duration-300 no-print ${
        isDark ? 'bg-zinc-950/85 border-zinc-900' : 'bg-white/85 border-zinc-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]'
      }`}>
        <div className="max-w-md mx-auto flex items-center justify-around py-3 px-2">
          {/* Tab 1: Overview */}
          <button
            onClick={() => setMobileTab('overview')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
              mobileTab === 'overview'
                ? 'text-emerald-500 scale-105'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* Tab 2: Transactions */}
          <button
            onClick={() => setMobileTab('transactions')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
              mobileTab === 'transactions'
                ? 'text-emerald-500 scale-105'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Receipt size={18} />
            <span>Transaksi</span>
          </button>

          {/* Tab 3: Analytics */}
          <button
            onClick={() => setMobileTab('analysis')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
              mobileTab === 'analysis'
                ? 'text-emerald-500 scale-105'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ChartIcon size={18} />
            <span>Analisis</span>
          </button>
        </div>
      </nav>
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
          <div className={`w-full sm:max-w-md shadow-2xl relative rounded-t-[2rem] sm:rounded-3xl border transition-all flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-[#0b0b0e] border-zinc-800/80 text-white' : 'bg-white border-zinc-200/80 text-zinc-900'
          }`}>
            
            {/* Fixed Modal Header */}
            <div className={`p-5 flex justify-between items-center border-b ${
              isDark ? 'border-zinc-900 bg-zinc-950/20' : 'border-zinc-150 bg-zinc-50/50'
            }`}>
              <h3 className="text-md font-bold tracking-tight">
                {editingId ? 'Ubah Transaksi' : 'Transaksi Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setForm({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), receiptImage: '' });
                }}
                className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* Receipt Upload & Preview Section */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Foto Struk Belanja (Opsional)</label>
                  {form.receiptImage ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-emerald-500/20 h-40 w-full flex items-center justify-center bg-zinc-950/20">
                      <img src={form.receiptImage} alt="Preview Struk" className="h-full w-auto object-contain" />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, receiptImage: '' }))}
                        className="absolute top-2 right-2 p-2 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white cursor-pointer transition-all shadow-lg active:scale-95"
                        title="Hapus Struk"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label 
                        htmlFor="modal-receipt-upload" 
                        className={`w-full flex items-center justify-center gap-2 p-3 border border-dashed rounded-xl cursor-pointer transition-all active:scale-[0.99] ${
                          isDark 
                            ? 'bg-zinc-950/40 hover:bg-zinc-950/80 border-zinc-900 text-zinc-400 hover:text-white' 
                            : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-650 hover:text-zinc-900 shadow-sm'
                        }`}
                      >
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-bold">Pindai / Unggah Foto Struk</span>
                      </label>
                      <input
                        type="file"
                        id="modal-receipt-upload"
                        accept="image/*"
                        onChange={handleReceiptScan}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Transaction Type Segmented Toggle */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tipe Transaksi</label>
                  <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${isDark ? 'bg-zinc-950/80 border-zinc-900' : 'bg-zinc-100 border-zinc-200'}`}>
                    <button
                      type="button"
                      onClick={() => handleTypeChangeInForm('expense')}
                      className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        form.type === 'expense' 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Pengeluaran
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChangeInForm('income')}
                      className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        form.type === 'income' 
                          ? 'bg-emerald-500/10 text-emerald-650 border border-emerald-500/20' 
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Pemasukan
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Jumlah Dana (IDR)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500 text-sm font-bold pointer-events-none">Rp</span>
                    <input
                      type="text"
                      required
                      value={form.amount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, amount: val ? parseInt(val).toLocaleString('id-ID') : '' });
                      }}
                      className={`w-full border rounded-xl pl-10 pr-4 py-3 text-lg font-bold focus:outline-none transition-all ${
                        isDark 
                          ? 'bg-zinc-950/80 border-zinc-900 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 text-white placeholder:text-zinc-700' 
                          : 'bg-zinc-50 border-zinc-200 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/10 text-zinc-900 placeholder:text-zinc-400 shadow-sm'
                      }`}
                      placeholder="0"
                    />
                  </div>

                  {/* Spelling Spellout */}
                  {form.amount && (
                    <div className={`border rounded-xl p-3 space-y-1 ${isDark ? 'bg-zinc-950/50 border-zinc-900' : 'bg-zinc-50 border-zinc-200/85'}`}>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Tampilan Terbilang</p>
                      <p className="text-xs italic text-emerald-500 font-medium leading-relaxed">
                        &ldquo;{getTerbilang(parseInt(form.amount.replace(/\D/g, '')) || 0)}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Category Selection Visual Grid */}
                <div className="space-y-2">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'} block`}>Kategori</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {categories[form.type].map(cat => {
                      const meta = categoryMetadata[cat] || { icon: Tag, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', lightColor: 'text-zinc-650', lightBgColor: 'bg-zinc-100' };
                      const isSelected = form.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm({ ...form, category: cat })}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected 
                              ? (isDark ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-400 shadow-lg shadow-emerald-500/[0.05]' : 'bg-emerald-50 border-emerald-500/80 text-emerald-600 shadow-md shadow-emerald-500/[0.05]') 
                              : (isDark ? 'bg-zinc-950/50 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60')
                          }`}
                        >
                          <span className={`mb-1.5 ${isSelected ? (isDark ? 'text-emerald-400' : 'text-emerald-650') : (isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800')}`}>
                            {React.createElement(meta.icon, { className: "w-5 h-5" })}
                          </span>
                          <span className="text-[10px] font-bold tracking-tight">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Deskripsi Ringkas</label>
                  <input
                    type="text"
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Contoh: Belanja bahan dapur mingguan"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark 
                        ? 'bg-zinc-950/80 border-zinc-900 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 text-white placeholder:text-zinc-600' 
                        : 'bg-zinc-50 border-zinc-200 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/10 text-zinc-900 placeholder:text-zinc-400 shadow-sm'
                    }`}
                  />
                </div>

                {/* Transaction Date Input */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tanggal</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer ${
                        isDark 
                          ? 'bg-zinc-950/80 border-zinc-900 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 text-white' 
                          : 'bg-zinc-50 border-zinc-200 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/10 text-zinc-900 shadow-sm'
                      }`}
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Fixed Modal Footer */}
            <div className={`p-5 border-t flex gap-3 ${
              isDark ? 'bg-zinc-950/90 border-zinc-900' : 'bg-zinc-50 border-zinc-150 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setForm({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().slice(0, 10), receiptImage: '' });
                }}
                className={`flex-1 py-3 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                form="transaction-form"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all active:scale-[0.985] shadow-lg shadow-emerald-950/20 cursor-pointer"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Target Menabung Baru / Edit */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className={`w-full sm:max-w-md shadow-2xl relative rounded-t-[2rem] sm:rounded-3xl border transition-all flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-[#0b0b0e] border-zinc-800/80 text-white' : 'bg-white border-zinc-200/80 text-zinc-900'
          }`}>
            <div className={`p-5 flex justify-between items-center border-b ${
              isDark ? 'border-zinc-900 bg-zinc-950/20' : 'border-zinc-150 bg-zinc-50/50'
            }`}>
              <h3 className="text-md font-bold tracking-tight">
                {editingGoalId ? 'Ubah Target Menabung' : 'Target Menabung Baru'}
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-left">
              <form id="goal-form" onSubmit={handleSaveGoal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nama Target</label>
                  <input
                    type="text"
                    required
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    placeholder="Contoh: Dana Darurat, Beli HP"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Target Dana (Rp)</label>
                  <input
                    type="text"
                    required
                    value={goalForm.targetAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setGoalForm({ ...goalForm, targetAmount: val ? parseInt(val).toLocaleString('id-ID') : '' });
                    }}
                    placeholder="Contoh: 10.000.000"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Dana Terkumpul Awal (Rp - Opsional)</label>
                  <input
                    type="text"
                    value={goalForm.currentAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setGoalForm({ ...goalForm, currentAmount: val ? parseInt(val).toLocaleString('id-ID') : '' });
                    }}
                    placeholder="0"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Target Tanggal Selesai (Opsional)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={goalForm.targetDate}
                      onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer ${
                        isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                      }`}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className={`p-5 border-t flex gap-3 ${
              isDark ? 'bg-zinc-950/90 border-zinc-900' : 'bg-zinc-50 border-zinc-150 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className={`flex-1 py-3 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                form="goal-form"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all active:scale-[0.985] shadow-lg cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Dana Tabungan */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className={`w-full sm:max-w-md shadow-2xl relative rounded-t-[2rem] sm:rounded-3xl border transition-all flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-[#0b0b0e] border-zinc-800/80 text-white' : 'bg-white border-zinc-200/80 text-zinc-900'
          }`}>
            <div className={`p-5 flex justify-between items-center border-b ${
              isDark ? 'border-zinc-900 bg-zinc-950/20' : 'border-zinc-150 bg-zinc-50/50'
            }`}>
              <h3 className="text-md font-bold tracking-tight">Tambah Dana Tabungan</h3>
              <button
                onClick={() => setIsAddFundsModalOpen(false)}
                className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-left">
              <form id="funds-form" onSubmit={handleSaveFunds} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Jumlah Dana Yang Ditabung (Rp)</label>
                  <input
                    type="text"
                    required
                    value={fundsAmountInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFundsAmountInput(val ? parseInt(val).toLocaleString('id-ID') : '');
                    }}
                    placeholder="Masukkan jumlah dana..."
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="deduct-balance"
                    checked={isDeductFromBalance}
                    onChange={(e) => setIsDeductFromBalance(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 border-zinc-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="deduct-balance" className={`text-xs font-medium cursor-pointer ${isDark ? 'text-zinc-300' : 'text-zinc-650'}`}>
                    Catat sebagai pengeluaran (Kategori: Investasi) untuk memotong saldo utama
                  </label>
                </div>
              </form>
            </div>

            <div className={`p-5 border-t flex gap-3 ${
              isDark ? 'bg-zinc-950/90 border-zinc-900' : 'bg-zinc-50 border-zinc-150 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => setIsAddFundsModalOpen(false)}
                className={`flex-1 py-3 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                form="funds-form"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all active:scale-[0.985] shadow-lg cursor-pointer"
              >
                Simpan Dana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Transaksi Rutin Baru / Edit */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className={`w-full sm:max-w-md shadow-2xl relative rounded-t-[2rem] sm:rounded-3xl border transition-all flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-[#0b0b0e] border-zinc-800/80 text-white' : 'bg-white border-zinc-200/80 text-zinc-900'
          }`}>
            <div className={`p-5 flex justify-between items-center border-b ${
              isDark ? 'border-zinc-900 bg-zinc-950/20' : 'border-zinc-150 bg-zinc-50/50'
            }`}>
              <h3 className="text-md font-bold tracking-tight">
                {editingRecurringId ? 'Ubah Transaksi Rutin' : 'Transaksi Rutin Baru'}
              </h3>
              <button
                onClick={() => setIsRecurringModalOpen(false)}
                className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-left">
              <form id="recurring-form" onSubmit={handleSaveRecurring} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Deskripsi / Nama</label>
                  <input
                    type="text"
                    required
                    value={recurringForm.description}
                    onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
                    placeholder="Contoh: Wifi Biznet, BPJS Kesehatan"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tipe</label>
                  <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${isDark ? 'bg-zinc-950/80 border-zinc-900' : 'bg-zinc-100 border-zinc-200'}`}>
                    <button
                      type="button"
                      onClick={() => setRecurringForm({ ...recurringForm, type: 'expense' })}
                      className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        recurringForm.type === 'expense' 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Pengeluaran
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurringForm({ ...recurringForm, type: 'income' })}
                      className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        recurringForm.type === 'income' 
                          ? 'bg-emerald-500/10 text-emerald-650 border border-emerald-500/20' 
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Pemasukan
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Jumlah (Rp)</label>
                  <input
                    type="text"
                    required
                    value={recurringForm.amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setRecurringForm({ ...recurringForm, amount: val ? parseInt(val).toLocaleString('id-ID') : '' });
                    }}
                    placeholder="Contoh: 350.000"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Kategori</label>
                  <select
                    value={recurringForm.category}
                    onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
                    required
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer ${
                      isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                    }`}
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories[recurringForm.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Frekuensi</label>
                  <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${isDark ? 'bg-zinc-950/80 border-zinc-900' : 'bg-zinc-100 border-zinc-200'}`}>
                    <button
                      type="button"
                      onClick={() => setRecurringForm({ ...recurringForm, frequency: 'monthly' })}
                      className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        recurringForm.frequency === 'monthly' 
                          ? 'bg-emerald-500/10 text-emerald-650 border border-emerald-500/20' 
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Bulanan
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurringForm({ ...recurringForm, frequency: 'weekly' })}
                      className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        recurringForm.frequency === 'weekly' 
                          ? 'bg-emerald-500/10 text-emerald-650 border border-emerald-500/20' 
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Mingguan
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tanggal Jatuh Tempo Berikutnya</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-emerald-500 pointer-events-none flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      required
                      value={recurringForm.nextDueDate}
                      onChange={(e) => setRecurringForm({ ...recurringForm, nextDueDate: e.target.value })}
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer ${
                        isDark ? 'bg-zinc-950/80 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                      }`}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className={`p-5 border-t flex gap-3 ${
              isDark ? 'bg-zinc-950/90 border-zinc-900' : 'bg-zinc-50 border-zinc-150 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => setIsRecurringModalOpen(false)}
                className={`flex-1 py-3 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                form="recurring-form"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all active:scale-[0.985] shadow-lg cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Scanning Progress Overlay Modal */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm rounded-3xl p-8 border text-center transition-all ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
          }`}>
            <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              {/* Animated Camera scan box */}
              <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-2xl animate-pulse" />
              <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {/* Scanning green line animation */}
              <div className="absolute left-1 right-1 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400/50 rounded-full animate-scan" style={{
                animation: 'scan 2s linear infinite'
              }} />
            </div>

            <h3 className="text-md font-bold mb-1">Memindai Struk Belanja</h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mb-4`}>
              Menggunakan kecerdasan buatan Gemini AI untuk menganalisis data pengeluaran Anda secara presisi.
            </p>

            <div className="space-y-2">
              <div className={`text-xs py-2.5 px-4 rounded-xl border font-mono ${
                isDark ? 'bg-zinc-900/40 border-zinc-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
                {scanProgress}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OCR Error Notification Toast */}
      {scanError && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 border rounded-2xl p-4 bg-rose-500/10 border-rose-500/20 text-rose-500 backdrop-blur-md z-50 flex items-start gap-3 shadow-2xl">
          <span className="text-lg leading-none">⚠️</span>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Gagal Membaca Struk</h4>
            <p className="text-xs mt-0.5 opacity-90">{scanError}</p>
          </div>
          <button 
            onClick={() => setScanError('')} 
            className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransactionForDetails && (() => {
        const t = selectedTransactionForDetails;
        const meta = categoryMetadata[t.category] || { icon: Tag, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', lightColor: 'text-zinc-650', lightBgColor: 'bg-zinc-100' };
        
        return (
          <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 no-print animate-fade-in">
            <div className={`w-full sm:max-w-md shadow-2xl relative rounded-t-[2rem] sm:rounded-3xl border transition-all flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden ${
              isDark ? 'bg-[#0b0b0e] border-zinc-800/80 text-white' : 'bg-white border-zinc-200/80 text-zinc-900'
            }`}>
              {/* Header */}
              <div className={`p-5 flex justify-between items-center border-b ${
                isDark ? 'border-zinc-900 bg-zinc-950/20' : 'border-zinc-150 bg-zinc-50/50'
              }`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Detail Transaksi
                </h3>
                <button
                  onClick={() => setSelectedTransactionForDetails(null)}
                  className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                    isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-6 overflow-y-auto text-left flex-grow">
                {/* Main Category Badge & Amount */}
                <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-dashed border-zinc-800/25 dark:border-zinc-800">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border text-2xl ${
                    isDark ? 'border-zinc-800/50' : 'border-zinc-200/60'
                  } ${isDark ? meta.bgColor : meta.lightBgColor}`}>
                    {React.createElement(meta.icon, {
                      className: `w-7 h-7 ${isDark ? meta.color : meta.lightColor}`
                    })}
                  </div>
                  
                  <div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      t.type === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : (isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-650')
                    }`}>
                      {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </div>
                  
                  <h4 className={`text-2xl font-black tracking-tight ${
                    t.type === 'income' ? 'text-emerald-500' : (isDark ? 'text-white' : 'text-zinc-900')
                  }`}>
                    {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                  </h4>
                </div>

                {/* Properties Grid */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Deskripsi</span>
                    <p className={`text-sm font-semibold mt-0.5 leading-relaxed break-words ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      {t.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Kategori</span>
                      <p className="text-xs font-bold mt-0.5 flex items-center gap-1.5">
                        <span className={isDark ? meta.color : meta.lightColor}>
                          {React.createElement(meta.icon, { className: "w-3.5 h-3.5" })}
                        </span>
                        <span>{t.category}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Tanggal</span>
                      <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        {new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scanned Receipt Section */}
                {t.receiptImage && (
                  <div className="pt-4 border-t border-zinc-800/10 dark:border-zinc-850">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider block mb-2">Lampiran Struk Belanja</span>
                    <div 
                      onClick={() => {
                        setSelectedTransactionForDetails(null);
                        setActiveReceiptImage(t.receiptImage || null);
                      }}
                      className={`relative w-full h-32 border border-dashed rounded-2xl overflow-hidden cursor-pointer group flex items-center justify-center transition-all ${
                        isDark ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40' : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50'
                      }`}
                    >
                      <img 
                        src={t.receiptImage} 
                        alt="Struk Belanja Mini" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase text-white bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-750">
                          Perbesar Gambar
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className={`p-5 border-t flex gap-3 ${
                isDark ? 'bg-zinc-950/90 border-zinc-900' : 'bg-zinc-50 border-zinc-150 shadow-sm'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTransactionForDetails(null);
                    editTransaction(t);
                  }}
                  className={`flex-1 py-3 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-650 hover:text-zinc-900'
                  }`}
                >
                  <Edit2 size={13} />
                  <span>Ubah</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTransactionForDetails(null);
                    deleteTransaction(t.id);
                  }}
                  className={`flex-1 py-3 border rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-rose-950/10 border-rose-950/30 text-rose-400 hover:bg-rose-500/10' : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Receipt Photo Lightbox Viewer Overlay Modal */}
      {activeReceiptImage && (
        <div 
          onClick={() => setActiveReceiptImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-4 cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-lg w-full flex flex-col items-center gap-4"
          >
            <button 
              onClick={() => setActiveReceiptImage(null)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer shadow-lg"
            >
              <X size={18} />
            </button>
            <div className="w-full bg-zinc-950 border border-zinc-900/65 rounded-3xl overflow-hidden p-2 flex items-center justify-center shadow-2xl">
              <img 
                src={activeReceiptImage} 
                alt="Struk Belanja Detail" 
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl" 
              />
            </div>
            <p className="text-zinc-400 text-[11px] font-semibold tracking-wide bg-zinc-900/70 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-850">
              Ketuk di luar area gambar untuk menutup
            </p>
          </div>
        </div>
      )}
      </div>

      {/* PRINT-ONLY DEDICATED REPORT TEMPLATE */}
      <div className="print-only p-8 bg-white text-zinc-900 font-sans text-xs">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-zinc-300 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Saku</h1>
            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              {filterDate ? 'Laporan Keuangan Harian' : 'Laporan Keuangan Bulanan'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-zinc-800">Periode: {(() => {
              if (filterDate) {
                return new Date(filterDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
              }
              if (!filterMonth) return '';
              const [year, month] = filterMonth.split('-');
              return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            })()}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-6 mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide">Pemilik Laporan</p>
            <p className="text-sm font-bold text-zinc-800 mt-0.5">{user?.name || 'Pengguna Demo'}</p>
            <p className="text-xs text-zinc-500">{user?.email || 'demo@saku.app'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wide">Metode Sinkronisasi</p>
            <p className="text-xs font-semibold text-zinc-700 mt-1">
              {isSupabaseConfigured ? 'Supabase Database (Cloud)' : 'Browser Local Storage (Lokal)'}
            </p>
          </div>
        </div>

        {/* Financial Highlights Summary Table */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Ringkasan Mutasi Keuangan</h2>
          <table className="w-full border-collapse border border-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold uppercase text-zinc-650">
                <th className="px-4 py-2 border-r border-zinc-200">Saldo Awal</th>
                <th className="px-4 py-2 border-r border-zinc-200">Total Pemasukan (CR)</th>
                <th className="px-4 py-2 border-r border-zinc-200">Total Pengeluaran (DB)</th>
                <th className="px-4 py-2">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-sm font-bold text-zinc-850 border-b border-zinc-200">
                <td className="px-4 py-3 border-r border-zinc-200 text-zinc-700">{formatRupiah(startingBalance)}</td>
                <td className="px-4 py-3 border-r border-zinc-200 text-emerald-600">+{formatRupiah(monthlyIncome)}</td>
                <td className="px-4 py-3 border-r border-zinc-200 text-rose-600">-{formatRupiah(monthlyExpense)}</td>
                <td className="px-4 py-3 font-extrabold text-zinc-900 bg-zinc-50/50">
                  {formatRupiah(startingBalance + monthlyIncome - monthlyExpense)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Category Spending Table */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Penyebaran Pengeluaran Kategori</h2>
          <table className="w-full border-collapse border border-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold uppercase text-zinc-600">
                <th className="px-4 py-2 border-r border-zinc-200">Kategori</th>
                <th className="px-4 py-2 border-r border-zinc-200">Jumlah Transaksi</th>
                <th className="px-4 py-2 border-r border-zinc-200">Total Pengeluaran</th>
                <th className="px-4 py-2">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {categorySpending.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-xs text-zinc-400 border-b border-zinc-200">Tidak ada transaksi pengeluaran dalam periode ini.</td>
                </tr>
              ) : (
                categorySpending.map((c) => (
                  <tr key={c.name} className="text-xs text-zinc-700 border-b border-zinc-200">
                    <td className="px-4 py-2.5 border-r border-zinc-200 font-bold">{c.name}</td>
                    <td className="px-4 py-2.5 border-r border-zinc-200">
                      {transactions.filter(t => {
                        if (filterDate) return t.date === filterDate && t.category === c.name;
                        return t.date.startsWith(filterMonth) && t.category === c.name;
                      }).length}x
                    </td>
                    <td className="px-4 py-2.5 border-r border-zinc-200 font-semibold">{formatRupiah(c.amount)}</td>
                    <td className="px-4 py-2.5 font-bold text-zinc-800">{c.percentage.toFixed(0)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detailed Transactions List Table */}
        <div>
          <h2 className="text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Daftar Mutasi Transaksi (Statement)</h2>
          <table className="w-full border-collapse border border-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] font-bold uppercase text-zinc-650">
                <th className="px-4 py-2 border-r border-zinc-200 w-24">Tanggal</th>
                <th className="px-4 py-2 border-r border-zinc-200">Keterangan / Deskripsi</th>
                <th className="px-4 py-2 border-r border-zinc-200 w-32 text-right">Pengeluaran (Debit)</th>
                <th className="px-4 py-2 border-r border-zinc-200 w-32 text-right">Pemasukan (Kredit)</th>
                <th className="px-4 py-2 w-32 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const monthTransactions = transactions
                  .filter(t => {
                    if (filterDate) return t.date === filterDate;
                    return t.date.startsWith(filterMonth);
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                if (monthTransactions.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-xs text-zinc-400 border-b border-zinc-200">Tidak ada riwayat transaksi pada periode ini.</td>
                    </tr>
                  );
                }

                let currentBal = startingBalance;

                return monthTransactions.map((t) => {
                  if (t.type === 'income') {
                    currentBal += t.amount;
                  } else {
                    currentBal -= t.amount;
                  }
                  
                  return (
                    <tr key={t.id} className="text-xs text-zinc-700 border-b border-zinc-200">
                      <td className="px-4 py-2.5 border-r border-zinc-200 font-mono">
                        {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2.5 border-r border-zinc-200">
                        <span className="font-semibold text-zinc-900 block">{t.description}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">{t.category}</span>
                      </td>
                      <td className="px-4 py-2.5 border-r border-zinc-200 text-rose-600 font-medium font-mono text-right">
                        {t.type === 'expense' ? formatRupiah(t.amount) : '-'}
                      </td>
                      <td className="px-4 py-2.5 border-r border-zinc-200 text-emerald-600 font-medium font-mono text-right">
                        {t.type === 'income' ? formatRupiah(t.amount) : '-'}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-zinc-900 font-mono text-right bg-zinc-50/30">
                        {formatRupiah(currentBal)}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Report Footer */}
        <div className="mt-12 text-center text-[10px] text-zinc-400 border-t border-zinc-200 pt-4">
          Dokumen laporan keuangan Saku ini diterbitkan secara sah dan otomatis.
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="month"]::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          cursor: pointer;
          opacity: 0;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
