"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { CoinPackage } from "@lalakon/shared";

const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-zl4NzNDbY417dkML";

export default function CoinsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchProfile } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchPackages();
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const verifyPayment = async (orderId: string) => {
    try {
      const res = await api.post("/payment/verify-coin-payment", { orderId });
      if (res.data.paid) {
        setSuccessMsg(res.data.message || "Pembayaran Berhasil! Koin telah ditambahkan ke akun Anda.");
        await fetchProfile();
      }
    } catch (err) {
      console.error("Gagal memverifikasi pembayaran koin:", err);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payment/coin-packages");
      setPackages(res.data);
    } catch (err: any) {
      console.error("Gagal mengambil paket koin:", err);
      // Fallback data jika backend belum respon
      setPackages([
        { id: 1, slug: "coin_50", name: "Paket Basic (50 Koin)", coins_amount: 50, price: 20000, description: "Cukup untuk menonton 3-4 film pilihan", is_active: true },
        { id: 2, slug: "coin_120", name: "Paket Popular (120 Koin)", coins_amount: 120, price: 45000, description: "Hemat 25%! Cukup untuk menonton 8 film pilihan", is_active: true },
        { id: 3, slug: "coin_300", name: "Paket Super (300 Koin)", coins_amount: 300, price: 100000, description: "Bonus Koin terbanyak! Nonton sepuasnya", is_active: true },
        { id: 4, slug: "coin_700", name: "Paket Sultan (700 Koin)", coins_amount: 700, price: 200000, description: "Akses tanpa batas, paling hemat untuk penikmat film", is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCoin = async (pkg: CoinPackage) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/coins`);
      return;
    }

    try {
      setBuyingId(pkg.id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await api.post("/payment/checkout-coins", { packageId: pkg.id });
      const { token, order_id } = res.data;

      if (!token) {
        throw new Error("Token transaksi tidak didapatkan.");
      }

      // Trigger Midtrans Snap Popup
      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: async (result: any) => {
            console.log("Pembayaran Berhasil:", result);
            const targetOrderId = result?.order_id || order_id;
            if (targetOrderId) {
              await verifyPayment(targetOrderId);
            } else {
              await fetchProfile();
            }
          },
          onPending: async (result: any) => {
            console.log("Pembayaran Pending:", result);
            setSuccessMsg("Menunggu pembayaran. Setelah Anda membayar di simulator, klik 'Verifikasi Pembayaran' atau refresh halaman.");
          },
          onError: (result: any) => {
            console.error("Pembayaran Gagal:", result);
            setErrorMsg("Pembayaran gagal. Silakan coba kembali.");
          },
          onClose: async () => {
            console.log("Snap popup ditutup. Memeriksa status pembayaran...");
            if (order_id) {
              await verifyPayment(order_id);
            }
          },
        });
      } else {
        // Direct redirect fallback jika script snap belum load
        if (res.data.redirect_url) {
          window.location.href = res.data.redirect_url;
        }
      }
    } catch (err: any) {
      console.error("Gagal melakukan checkout koin:", err);
      setErrorMsg(err.response?.data?.message || "Gagal memproses transaksi. Coba lagi nanti.");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <>
      {/* Midtrans Snap Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="bg-white dark:bg-neutral-950 min-h-screen text-neutral-900 dark:text-white pb-32 font-sans transition-colors duration-300">
        {/* Navigation Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between relative z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 transition-all group"
            >
              <Icon name="arrow-right" className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              <span className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors" onClick={() => router.push("/")}>Home</span>
              <Icon name="chevron-right" className="w-3 h-3" />
              <span className="text-amber-500">Top Up Koin</span>
            </div>
          </div>

          {/* Current Balance Display */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-sm">
              <span className="text-lg">🪙</span>
              <span>Saldo Koin: <strong className="text-amber-400 font-black">{user?.coins ?? 0} Koin</strong></span>
            </div>
          )}
        </div>

        {/* Hero Banner */}
        <section className="relative pt-20 pb-16 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent -z-10" />

          <div className="max-w-4xl px-6 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 uppercase tracking-widest">
              <span>🪙</span>
              Top Up Koin Sinea
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">Beli Koin,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600">Nonton Film Pilihanmu (30 Hari)</span>
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Gunakan koin untuk membuka akses film favorit Anda selama 30 hari penuh. Bebas tonton kapan saja tanpa iklan!
            </p>
          </div>
        </section>

        {/* Alert Notifications */}
        <div className="max-w-4xl mx-auto px-6 mb-8">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-xs underline ml-4">Tutup</button>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-semibold flex items-center justify-between">
              <span>✅ {successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-xs underline ml-4">Tutup</button>
            </div>
          )}
        </div>

        {/* Package Cards */}
        <section className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => {
              const isPopular = pkg.coins_amount === 120;
              return (
                <div
                  key={pkg.id}
                  className={cn(
                    "group relative p-6 rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden shadow-xl",
                    isPopular
                      ? "border-amber-500 bg-amber-500/5 dark:bg-amber-950/20"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/80"
                  )}
                >
                  {isPopular && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      Paling Laris
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
                      🪙
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">{pkg.name}</h3>
                      <div className="text-3xl font-black text-amber-500">
                        {pkg.coins_amount} <span className="text-sm font-bold text-neutral-400">Koin</span>
                      </div>
                      <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                        {pkg.description || `Dapatkan ${pkg.coins_amount} koin untuk nonton film`}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-200 dark:border-white/5">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Harga</span>
                      <div className="text-2xl font-black text-neutral-900 dark:text-white">
                        Rp {pkg.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyCoin(pkg)}
                    disabled={buyingId === pkg.id}
                    className={cn(
                      "mt-8 w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                      isPopular
                        ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20"
                        : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-amber-500 hover:text-neutral-950 transition-colors"
                    )}
                  >
                    {buyingId === pkg.id ? (
                      <span className="animate-pulse">Memproses...</span>
                    ) : (
                      <>
                        <span>Beli {pkg.coins_amount} Koin</span>
                        <Icon name="arrow-right" className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works info */}
        <section className="max-w-4xl mx-auto px-6 mt-24 text-center space-y-8">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Cara Kerja Koin Sinea</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 space-y-3">
              <div className="text-3xl">1️⃣</div>
              <h4 className="font-bold text-sm">Top Up Koin</h4>
              <p className="text-xs text-neutral-500">Pilih paket koin yang Anda butuhkan dan bayar via metode pilihan Midtrans.</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 space-y-3">
              <div className="text-3xl">2️⃣</div>
              <h4 className="font-bold text-sm">Pilih & Beli Film</h4>
              <p className="text-xs text-neutral-500">Gunakan koin Anda untuk membuka film apa saja yang ingin ditonton.</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 space-y-3">
              <div className="text-3xl">3️⃣</div>
              <h4 className="font-bold text-sm">Nonton 30 Hari</h4>
              <p className="text-xs text-neutral-500">Akses film yang dibeli berlaku selama 30 hari penuh. Trailer tetap bisa ditonton gratis!</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
