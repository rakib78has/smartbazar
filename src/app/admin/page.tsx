'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Search,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  ArrowLeft,
  Printer,
  Save,
  LogOut,
  Upload,
  Sparkles,
  Download,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { Order, OrderStatus } from '@/types/order';
import { StoreSettings } from '@/types/store';
import { initialProducts, initialOrders, initialStoreSettings, initialCategories } from '@/lib/mock-data';
import { useCart } from '@/context/CartContext';
import { isUserAuthenticated, logoutAdmin } from '@/lib/auth';
import { exportOrdersToCSV, exportSteadfastCSV } from '@/lib/export';
import {
  fetchProducts,
  saveProductToDb,
  deleteProductFromDb,
  fetchOrders,
  updateOrderStatusInDb,
  uploadImageFile,
} from '@/lib/db';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { storeSettings, updateStoreSettings } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'fraud' | 'settings'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newBlacklistPhone, setNewBlacklistPhone] = useState('');

  // Authentication Guard
  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace('/admin/login');
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // State for products & orders
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Fraud prevention / Risky customer flagged phone numbers
  const [flaggedPhones, setFlaggedPhones] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smartbazar_flagged_phones');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const toggleFlaggedPhone = (phone: string) => {
    setFlaggedPhones((prev) => {
      const next = prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone];
      try {
        localStorage.setItem('smartbazar_flagged_phones', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isCustomerRisky = (phone: string) => {
    if (flaggedPhones.includes(phone)) return true;
    const customerOrders = orders.filter((o) => o.customerPhone === phone);
    return customerOrders.some((o) => o.status === 'cancelled' || o.status === 'returned');
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);

  // New product modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('clothing');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCostPrice, setNewProdCostPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleGenerateAIDescription = async () => {
    if (!newProdName.trim()) {
      alert('অনুগ্রহ করে আগে পণ্যের নাম লিখুন!');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProdName, category: newProdCategory }),
      });
      const data = await res.json();
      if (data.description) {
        setNewProdDesc(data.description);
      }
    } catch {
      alert('AI বিবরণী তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Invoice modal
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Load products & orders from DB (Supabase or fallback)
  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      try {
        localStorage.setItem('smartbazar_admin_products', JSON.stringify(data));
      } catch {}
    });

    fetchOrders().then((data) => {
      setOrders(data);
      try {
        localStorage.setItem('smartbazar_orders', JSON.stringify(data));
      } catch {}
    });
  }, []);

  // Sync settings when context changes
  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  // Handle direct image file upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const uploadedUrl = await uploadImageFile(file);
    if (uploadedUrl) {
      setNewProdImage(uploadedUrl);
      setIsUploadingImage(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProdImage(reader.result as string);
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Save product helper
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: newProdName.toLowerCase().replace(/\s+/g, '-'),
      name: newProdName,
      description: newProdDesc || newProdName,
      category: newProdCategory,
      basePrice: Number(newProdPrice),
      costPrice: newProdCostPrice ? Number(newProdCostPrice) : Math.round(Number(newProdPrice) * 0.6),
      images: [
        newProdImage ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      stock: Number(newProdStock),
      variants: [],
      tags: [newProdCategory],
      isPublished: true,
      isFeatured: false,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    await saveProductToDb(newProduct);
    try {
      localStorage.setItem('smartbazar_admin_products', JSON.stringify(updated));
    } catch {}

    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCostPrice('');
    setNewProdStock('20');
    setNewProdDesc('');
    setNewProdImage('');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই পণ্যটি ডিলিট করতে চান?')) return;
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    await deleteProductFromDb(id);
    try {
      localStorage.setItem('smartbazar_admin_products', JSON.stringify(updated));
    } catch {}
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    await updateOrderStatusInDb(orderId, newStatus);
    try {
      localStorage.setItem('smartbazar_orders', JSON.stringify(updated));
    } catch {}
  };

  const handleUpdateCourier = (orderId: string, trackingCode: string, courierName?: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            courierTrackingCode: trackingCode,
            courierName: courierName !== undefined ? courierName : o.courierName,
          }
        : o
    );
    setOrders(updated);
    try {
      localStorage.setItem('smartbazar_orders', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    alert('স্টোর সেটিংস সফলভাবে আপডেট করা হয়েছে!');
  };

  const handleLogout = () => {
    logoutAdmin();
    router.replace('/admin/login');
  };

  // Analytics Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((sum, o) => sum + o.total, 0);

  const totalDelivered = orders.filter((o) => o.status === 'delivered').length;
  const totalPending = orders.filter((o) => o.status === 'pending').length;
  const totalShipped = orders.filter((o) => o.status === 'shipped').length;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400 font-mono">নিরাপত্তা যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
            aria-label="Toggle admin sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500 text-gray-950 font-black flex items-center justify-center text-xs">
              SB
            </span>
            <span className="font-bold text-sm truncate">{storeSettings.storeName}</span>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white text-xs flex items-center gap-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>সাইট</span>
        </Link>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-2xs"
        />
      )}

      {/* ================= LEFT SIDEBAR PANEL ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-gray-950 font-black flex items-center justify-center text-sm shadow-md">
                SB
              </span>
              <div className="overflow-hidden">
                <h1 className="font-extrabold text-sm truncate">{storeSettings.storeName}</h1>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">অ্যাডমিন হাব</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              ম্যানেজমেন্ট মেনু
            </div>

            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>ড্যাশবোর্ড ও রিপোর্ট</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeTab === 'overview' ? 'rotate-90' : 'text-gray-500'
                }`}
              />
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>অর্ডার ও কুরিয়ার</span>
              </div>
              <div className="flex items-center gap-1.5">
                {totalPending > 0 && (
                  <span className="bg-amber-500 text-gray-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {totalPending}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeTab === 'orders' ? 'rotate-90' : 'text-gray-500'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>পণ্য ও স্টক</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-semibold">{products.length}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeTab === 'products' ? 'rotate-90' : 'text-gray-500'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('fraud');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fraud'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>ফ্রড প্রিভেনশন শিল্ড</span>
              </div>
              <div className="flex items-center gap-1.5">
                {flaggedPhones.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {flaggedPhones.length}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeTab === 'fraud' ? 'rotate-90' : 'text-gray-500'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>স্টোর ও হোয়াটসঅ্যাপ সেটিংস</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  activeTab === 'settings' ? 'rotate-90' : 'text-gray-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>লাইভ সাইট ভিজিট</span>
            </div>
            <span className="text-[10px] text-gray-400">নতুন ট্যাব ↗</span>
          </Link>

          <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-800 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-gray-200 truncate">admin@smartbazar.com</p>
              <p className="text-[9px] text-emerald-400">সুপার অ্যাডমিন</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors"
              title="সাইন আউট"
              aria-label="সাইন আউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">অ্যাডমিন</span>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-gray-900">
              {activeTab === 'overview' && 'ড্যাশবোর্ড ও রিপোর্ট'}
              {activeTab === 'orders' && 'অর্ডার ও কুরিয়ার পাইপলাইন'}
              {activeTab === 'products' && 'পণ্য ও স্টক ইনভেন্টরি'}
              {activeTab === 'fraud' && 'ফ্রড প্রিভেনশন ও ব্ল্যাকলিস্ট হাব'}
              {activeTab === 'settings' && 'স্টোর ও হোয়াটসঅ্যাপ কনফিগারেশন'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>লাইভ স্টোর দেখুন</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
        {/* ================= TAB 1: OVERVIEW & REPORTS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    মোট সেলস
                  </span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">৳{totalRevenue}</div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  মোট {orders.length} টি সফল অর্ডার
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    পেন্ডিং অর্ডার
                  </span>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{totalPending}</div>
                <p className="text-[11px] text-gray-500 mt-1">হোয়াটসঅ্যাপে কনফার্মেশনের অপেক্ষায়</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    কুরিয়ারে পাঠানো
                  </span>
                  <Truck className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-blue-600">{totalShipped}</div>
                <p className="text-[11px] text-gray-500 mt-1">পথে রয়েছে (ইন-ট্রানজিট)</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    ডেলিভার্ড সফল
                  </span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-emerald-600">{totalDelivered}</div>
                <p className="text-[11px] text-gray-500 mt-1">কাস্টমার পার্সেল রিসিভ করেছে</p>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">সাম্প্রতিক অর্ডারসমূহ</h3>
                  <p className="text-xs text-gray-500">সর্বশেষ প্রাপ্ত অর্ডারগুলোর তালিকা</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportOrdersToCSV(orders)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                    title="সব অর্ডার এক্সেল/CSV ফাইলে ডাউনলোড করুন"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>এক্সেল রিপোর্ট</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    সব অর্ডার দেখুন →
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">অর্ডার কোড</th>
                      <th className="p-3.5">কাস্টমার</th>
                      <th className="p-3.5">আইটেম</th>
                      <th className="p-3.5">মোট মূল্য</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5">হোয়াটসঅ্যাপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((ord) => {
                      const isRisky = isCustomerRisky(ord.customerPhone);
                      return (
                      <tr key={ord.id} className="hover:bg-gray-50/50">
                        <td className="p-3.5 font-bold text-gray-900">{ord.orderNumber}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-gray-800">{ord.customerName}</div>
                          <div className="text-[11px] text-gray-500">{ord.customerPhone}</div>
                          {isRisky && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                              ঝুঁকিপূর্ণ
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-gray-600">
                          {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-700">৳{ord.total}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'confirmed'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <a
                            href={`https://wa.me/88${ord.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>চ্যাট</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS & COURIER PIPELINE ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="অর্ডার নম্বর বা ফোন দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter & Export */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex gap-1.5 overflow-x-auto">
                  {['all', 'pending', 'confirmed', 'packaging', 'shipped', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shrink-0 transition-colors ${
                          orderStatusFilter === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => {
                    const filtered = orders.filter((o) => {
                      const matchesFilter = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                      const matchesQuery =
                        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.customerPhone.includes(orderSearch);
                      return matchesFilter && matchesQuery;
                    });
                    exportOrdersToCSV(filtered);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors shrink-0"
                  title="ফিল্টার করা সব অর্ডার Excel/CSV ফাইলে ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>এক্সেল এক্সপোর্ট</span>
                </button>

                <button
                  onClick={() => {
                    const filtered = orders.filter((o) => {
                      const matchesFilter = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                      const matchesQuery =
                        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.customerPhone.includes(orderSearch);
                      return matchesFilter && matchesQuery;
                    });
                    exportSteadfastCSV(filtered);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
                  title="Steadfast Merchant বাল্ক আপলোড ফরম্যাটে CSV ডাউনলোড করুন"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>স্টেডফাস্ট বাল্ক CSV</span>
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">অর্ডার কোড / সময়</th>
                      <th className="p-3.5">কাস্টমার ও ঠিকানা</th>
                      <th className="p-3.5">পণ্য ও ভ্যারিয়েন্ট</th>
                      <th className="p-3.5">মূল্য</th>
                      <th className="p-3.5">স্ট্যাটাস পরিবর্তন</th>
                      <th className="p-3.5">কুরিয়ার ট্র্যাকিং</th>
                      <th className="p-3.5 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders
                      .filter((o) => {
                        const matchesFilter =
                          orderStatusFilter === 'all' || o.status === orderStatusFilter;
                        const matchesQuery =
                          o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerPhone.includes(orderSearch);
                        return matchesFilter && matchesQuery;
                      })
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/50">
                          <td className="p-3.5">
                            <span className="font-bold text-gray-900 block">{ord.orderNumber}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-gray-800">{ord.customerName}</div>
                            <div className="text-emerald-700 font-semibold">{ord.customerPhone}</div>
                            <div className="text-[11px] text-gray-500 max-w-[200px] truncate" title={ord.deliveryAddress}>
                              {ord.deliveryAddress}
                            </div>
                            {isCustomerRisky(ord.customerPhone) && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>ঝুঁকিপূর্ণ কাস্টমার</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            {ord.items.map((i, idx) => (
                              <div key={idx} className="text-gray-700">
                                • {i.productName} {i.variantName ? `(${i.variantName})` : ''} x{' '}
                                <span className="font-bold">{i.quantity}</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-3.5">
                            <div className="font-black text-emerald-700 text-sm">৳{ord.total}</div>
                            <div className="text-[10px] text-gray-400">
                              চার্জ: ৳{ord.deliveryCharge}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                              }
                              className="text-xs font-semibold py-1 px-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="packaging">Packaging</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="returned">Returned</option>
                            </select>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1.5">
                              <select
                                value={ord.courierName || 'steadfast'}
                                onChange={(e) =>
                                  handleUpdateCourier(
                                    ord.id,
                                    ord.courierTrackingCode || '',
                                    e.target.value
                                  )
                                }
                                className="text-[10px] font-semibold py-1 px-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32"
                              >
                                <option value="steadfast">Steadfast (স্টেডফাস্ট)</option>
                                <option value="pathao">Pathao (পাঠাও)</option>
                                <option value="redx">RedX (রেডএক্স)</option>
                                <option value="paperfly">Paperfly (পেপারফ্লাই)</option>
                                <option value="sundarban">Sundarban (সুন্দরবন)</option>
                                <option value="other">অন্যান্য কুরিয়ার</option>
                              </select>
                              <input
                                type="text"
                                defaultValue={ord.courierTrackingCode || ''}
                                onBlur={(e) =>
                                  handleUpdateCourier(ord.id, e.target.value, ord.courierName)
                                }
                                placeholder="ট্র্যাকিং আইডি দিন..."
                                className="text-xs px-2 py-1 border border-gray-200 rounded-lg w-32 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => toggleFlaggedPhone(ord.customerPhone)}
                              className={`p-1.5 rounded-lg transition-colors inline-block ${
                                flaggedPhones.includes(ord.customerPhone)
                                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 ring-1 ring-rose-300'
                                  : 'text-gray-400 hover:text-rose-600 hover:bg-gray-100'
                              }`}
                              title={
                                flaggedPhones.includes(ord.customerPhone)
                                  ? 'ফ্রড তালিকা থেকে বাদ দিন'
                                  : 'সন্দেহজনক / ফ্রড কাস্টমার চিহ্নিত করুন'
                              }
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedOrderForInvoice(ord)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors inline-block"
                              title="ক্যাশ মেমো প্রিন্ট করুন"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <a
                              href={`https://wa.me/88${ord.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 transition-colors inline-block"
                              title="কাস্টমারের সাথে হোয়াটসঅ্যাপে কথা বলুন"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUCTS & INVENTORY CRUD ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পণ্য যুক্ত করুন</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">পণ্য</th>
                      <th className="p-3.5">ক্যাটাগরি</th>
                      <th className="p-3.5">বিক্রয় মূল্য</th>
                      <th className="p-3.5">কেনা দাম</th>
                      <th className="p-3.5">স্টক</th>
                      <th className="p-3.5">ভ্যারিয়েন্ট</th>
                      <th className="p-3.5 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products
                      .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/50">
                          <td className="p-3.5 flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{prod.name}</div>
                              <div className="text-[10px] text-gray-400">{prod.brand || 'No brand'}</div>
                            </div>
                          </td>
                          <td className="p-3.5 capitalize text-gray-600">{prod.category}</td>
                          <td className="p-3.5 font-bold text-gray-900">
                            ৳{prod.discountPrice || prod.basePrice}
                          </td>
                          <td className="p-3.5 text-gray-500">৳{prod.costPrice || '—'}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.stock < 5
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {prod.stock} টি
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-500">
                            {prod.variants.length > 0 ? `${prod.variants.length} টি` : 'নেই'}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="পণ্য ডিলিট করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: STORE & WHATSAPP SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">স্টোর ও হোয়াটসঅ্যাপ সেটিংস</h2>
            <p className="text-xs text-gray-500 mb-6">
              এখানে পরিবর্তিত যেকোনো তথ্য সাথে সাথে কাস্টমারদের ওয়েবসাইটে আপডেট হয়ে যাবে।
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">স্টোরের নাম</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={settingsForm.storeTagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeTagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* WhatsApp Number Configuration */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>অর্ডার গ্রহণের হোয়াটসঅ্যাপ নম্বর</span>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    প্রাথমিক হোয়াটসঅ্যাপ নম্বর (যেখানে কাস্টমার মেসেজ পাঠাবে)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.primaryWhatsAppNumber}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        primaryWhatsAppNumber: e.target.value,
                      })
                    }
                    placeholder="01XXXXXXXXX বা 8801XXXXXXXXX"
                    className="w-full px-3 py-2 border border-emerald-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-950"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    কাস্টমার "অর্ডার করুন" চাপলে এই নম্বরে মেসেজটি স্বয়ংক্রিয়ভাবে পৌঁছাবে।
                  </p>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ঢাকার ভেতরে ডেলিভারি চার্জ (৳)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.deliveryChargeInsideDhaka}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        deliveryChargeInsideDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ঢাকার বাইরে ডেলিভারি চার্জ (৳)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.deliveryChargeOutsideDhaka}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        deliveryChargeOutsideDhaka: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ফ্রি ডেলিভারি মিনিমাম অর্ডার (৳)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeDeliveryThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">শীর্ষ অ্যানাউন্সমেন্ট টেক্সট</label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.announcementActive}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          announcementActive: e.target.checked,
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-gray-600">চালু রাখুন</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      announcementText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>সেটিংস সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: FRAUD PREVENTION & BLACKLIST ================= */}
        {activeTab === 'fraud' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span>ফ্রড প্রিভেনশন ও কাস্টমার ব্ল্যাকলিস্ট হাব</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    সন্দেহজনক কাস্টমার ও পার্সেল রিটার্ন করা ফোন নম্বর পরিচালনা করুন। যেকোনো ব্ল্যাকলিস্টেড নম্বর থেকে অর্ডার আসলে স্বয়ংক্রিয় লাল সতর্কবার্তা দেখাবে।
                  </p>
                </div>

                <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold w-fit shrink-0">
                  মোট ফ্ল্যাগড নম্বর: {flaggedPhones.length} টি
                </span>
              </div>

              {/* Manual Phone Blacklist Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const clean = newBlacklistPhone.trim();
                  if (!clean) return;
                  if (!flaggedPhones.includes(clean)) {
                    toggleFlaggedPhone(clean);
                  }
                  setNewBlacklistPhone('');
                }}
                className="flex gap-2 max-w-md mb-6"
              >
                <input
                  type="text"
                  value={newBlacklistPhone}
                  onChange={(e) => setNewBlacklistPhone(e.target.value)}
                  placeholder="নতুন মোবাইল নম্বর লিখুন (যেমন: 01700000000)..."
                  className="flex-1 px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                >
                  ব্ল্যাকলিস্ট করুন
                </button>
              </form>

              {/* Flagged Phones Table */}
              {flaggedPhones.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">বর্তমানে কোনো ফোন নম্বর ফ্রড তালিকায় নেই</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">সব কাস্টমার নিরাপদ বিবেচিত হচ্ছে</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">ব্ল্যাকলিস্টেড মোবাইল নম্বর</th>
                        <th className="p-3">অর্ডার হিস্ট্রি</th>
                        <th className="p-3">ঝুঁকির ধরন</th>
                        <th className="p-3 text-right">একশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {flaggedPhones.map((ph) => {
                        const customerOrders = orders.filter((o) => o.customerPhone === ph);
                        const cancelledCount = customerOrders.filter(
                          (o) => o.status === 'cancelled' || o.status === 'returned'
                        ).length;
                        return (
                          <tr key={ph} className="hover:bg-gray-50/50">
                            <td className="p-3 font-bold text-rose-700 font-mono text-sm">{ph}</td>
                            <td className="p-3 text-gray-600">
                              মোট অর্ডার: <span className="font-bold">{customerOrders.length}</span> (বাতিল/রিটার্ন: <span className="text-rose-600 font-bold">{cancelledCount}</span>)
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                                🚨 সন্দেহজনক / পার্সেল রিটার্ন ঝুঁকি
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => toggleFlaggedPhone(ph)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                তালিকা থেকে আনব্লক করুন
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>

      {/* ================= MODAL: ADD NEW PRODUCT ================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 mb-4">নতুন পণ্য যুক্ত করুন</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম কটন পাঞ্জাবি"
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {initialCategories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="990"
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">কেনা দাম (Cost Price ৳)</label>
                  <input
                    type="number"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(e.target.value)}
                    placeholder="550"
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পণ্যের ছবি</label>
                
                {/* File picker */}
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl cursor-pointer transition-colors text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ছবি আপলোড করুন'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                  <span className="text-[10px] text-gray-400">অথবা নিচে URL দিন</span>
                </div>

                {/* Image Preview */}
                {newProdImage && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 mb-2">
                    <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewProdImage('')}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">পণ্যের বিবরণ</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{isGeneratingAI ? 'AI লিখছে...' : '✨ AI দিয়ে বিবরণী লিখুন'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="পণ্যের ফেব্রিক, সাইজ এবং বিশেষ সুবিধাসমূহ লিখুন অথবা উপরের AI বাটনে চাপ দিন..."
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT CASH MEMO / INVOICE ================= */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-100 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">{storeSettings.storeName}</h3>
                <p className="text-[10px] text-gray-500">ক্যাশ মেমো ও ডেলিভারি ইনভয়েস</p>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">অর্ডার নম্বর:</span>
                <span className="font-bold text-gray-800">{selectedOrderForInvoice.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">কাস্টমার নাম:</span>
                <span className="font-semibold text-gray-800">{selectedOrderForInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">মোবাইল:</span>
                <span className="font-semibold text-gray-800">{selectedOrderForInvoice.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ঠিকানা:</span>
                <span className="font-medium text-gray-800 text-right max-w-[200px]">
                  {selectedOrderForInvoice.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-[10px] text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-2">আইটেম</th>
                    <th className="p-2 text-center">পরিমাণ</th>
                    <th className="p-2 text-right">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedOrderForInvoice.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        {i.productName} {i.variantName ? `(${i.variantName})` : ''}
                      </td>
                      <td className="p-2 text-center">{i.quantity}</td>
                      <td className="p-2 text-right font-bold">৳{i.price * i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-right mb-6 text-gray-600">
              <div>সাবটোটাল: ৳{selectedOrderForInvoice.subtotal}</div>
              <div>ডেলিভারি চার্জ: ৳{selectedOrderForInvoice.deliveryCharge}</div>
              <div className="font-black text-gray-900 text-sm pt-1 border-t border-gray-200">
                মোট প্রদেয় (ক্যাশ অন ডেলিভারি): ৳{selectedOrderForInvoice.total}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
