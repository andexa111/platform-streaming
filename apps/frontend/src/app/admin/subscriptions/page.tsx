"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// Default Coin Packages fallback
const DEFAULT_COIN_PACKAGES = [
  {
    id: 1,
    name: "Paket 1",
    coins_amount: 50,
    price: 20000,
    badge: "Pemula",
    color: "text-amber-500",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
    buttonClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white hover:border-amber-500",
  },
  {
    id: 2,
    name: "Paket 2",
    coins_amount: 120,
    price: 45000,
    badge: "Populer (+20 Bonus)",
    color: "text-blue-500",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/5",
    buttonClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white hover:border-blue-500",
  },
  {
    id: 3,
    name: "Paket 3",
    coins_amount: 300,
    price: 100000,
    badge: "Hemat (+100 Bonus)",
    color: "text-purple-500",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/5",
    buttonClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white hover:border-purple-500",
  },
  {
    id: 4,
    name: "Paket 4",
    coins_amount: 620,
    price: 200000,
    badge: "Best Value (+220 Bonus)",
    color: "text-[#FFD700]",
    borderColor: "border-[#FFD700]/40",
    bgColor: "bg-[#FFD700]/5",
    buttonClass: "bg-gradient-to-r from-[#FFD700]/20 to-amber-500/20 text-[#B8860B] dark:text-[#FFD700] border border-[#FFD700]/30 hover:from-[#FFD700] hover:to-amber-500 hover:text-neutral-950 hover:border-[#FFD700]",
  },
];

const MOCK_COIN_PAYMENTS = [
  { id: 1, order_id: "COIN-1710001-U101", user: { name: "Budi Santoso", email: "budi@gmail.com" }, package: { name: "Paket 4", coins_amount: 620 }, coins_added: 620, amount: 200000, status: "paid", createdAt: "2026-10-04T10:15:00Z" },
  { id: 2, order_id: "COIN-1710002-U102", user: { name: "Siti Rahma", email: "siti@yahoo.com" }, package: { name: "Paket 2", coins_amount: 120 }, coins_added: 120, amount: 45000, status: "paid", createdAt: "2026-10-04T09:30:00Z" },
  { id: 3, order_id: "COIN-1710003-U103", user: { name: "Agus Pratama", email: "agus@gmail.com" }, package: { name: "Paket 1", coins_amount: 50 }, coins_added: 50, amount: 20000, status: "pending", createdAt: "2026-10-04T08:45:00Z" },
  { id: 4, order_id: "COIN-1710004-U104", user: { name: "Rina Anita", email: "rina@gmail.com" }, package: { name: "Paket 3", coins_amount: 300 }, coins_added: 300, amount: 100000, status: "paid", createdAt: "2026-10-03T16:20:00Z" },
  { id: 5, order_id: "COIN-1710005-U105", user: { name: "Deni Wijaya", email: "deni@outlook.com" }, package: { name: "Paket 2", coins_amount: 120 }, coins_added: 120, amount: 45000, status: "cancelled", createdAt: "2026-10-03T14:10:00Z" },
];

const MOCK_FILM_PURCHASES = [
  { id: 1, user: { name: "Budi Santoso", email: "budi@gmail.com" }, film: { title: "Lakon Cinta Pertama" }, coins_spent: 15, purchased_at: "2026-10-04T10:25:00Z", expires_at: "2026-11-03T10:25:00Z" },
  { id: 2, user: { name: "Siti Rahma", email: "siti@yahoo.com" }, film: { title: "Jalur Sutra Nusantara" }, coins_spent: 15, purchased_at: "2026-10-04T09:35:00Z", expires_at: "2026-11-03T09:35:00Z" },
  { id: 3, user: { name: "Rina Anita", email: "rina@gmail.com" }, film: { title: "Tragedi 1998" }, coins_spent: 20, purchased_at: "2026-10-03T16:45:00Z", expires_at: "2026-11-02T16:45:00Z" },
];

export default function CoinPackagesDashboard() {
  const [activeTab, setActiveTab] = useState<"plans" | "transactions">("plans");
  const [transactionType, setTransactionType] = useState<"topup" | "films">("topup");

  const [packages, setPackages] = useState<any[]>(DEFAULT_COIN_PACKAGES);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  const [coinPayments, setCoinPayments] = useState<any[]>(MOCK_COIN_PAYMENTS);
  const [filmPurchases, setFilmPurchases] = useState<any[]>(MOCK_FILM_PURCHASES);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch real data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const pkgRes = await api.get("/payment/coin-packages").catch(() => null);
      if (pkgRes?.data && Array.isArray(pkgRes.data) && pkgRes.data.length > 0) {
        const merged = pkgRes.data.map((pkg: any, idx: number) => ({
          ...DEFAULT_COIN_PACKAGES[idx % DEFAULT_COIN_PACKAGES.length],
          ...pkg,
        }));
        setPackages(merged);
      }

      const trxRes = await api.get("/payment/admin/transactions").catch(() => null);
      if (trxRes?.data) {
        if (Array.isArray(trxRes.data.coinPayments) && trxRes.data.coinPayments.length > 0) {
          setCoinPayments(trxRes.data.coinPayments);
        }
        if (Array.isArray(trxRes.data.filmPurchases) && trxRes.data.filmPurchases.length > 0) {
          setFilmPurchases(trxRes.data.filmPurchases);
        }
      }
    } catch (err) {
      console.error("Failed to load admin transaction data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdatePackagePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    const form = e.target as HTMLFormElement;
    const newPrice = Number((form.elements.namedItem("price") as HTMLInputElement).value);
    const newCoins = Number((form.elements.namedItem("coins_amount") as HTMLInputElement).value);

    try {
      setIsSavingPackage(true);
      if (editingPackage.id && typeof editingPackage.id === "number") {
        await api.patch(`/payment/admin/coin-packages/${editingPackage.id}`, {
          price: newPrice,
          coins_amount: newCoins,
        }).catch(() => {});
      }

      setPackages((prev) =>
        prev.map((p) => (p.id === editingPackage.id ? { ...p, price: newPrice, coins_amount: newCoins } : p))
      );
      setEditingPackage(null);
    } catch (err) {
      console.error("Gagal update paket koin:", err);
    } finally {
      setIsSavingPackage(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">
            Koin & Riwayat Transaksi
          </h1>
          <p className="text-muted-foreground text-sm font-bold">
            Atur skema paket koin platform dan pantau arus kas serta transaksi pembelian film.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-secondary rounded-2xl border border-border shadow-inner">
          <button
            onClick={() => setActiveTab("plans")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "plans" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Paket Koin
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "transactions" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Riwayat Transaksi
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "plans" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {packages.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "group relative p-6 md:p-8 rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-2 flex flex-col overflow-hidden bg-card/60 backdrop-blur-sm",
                plan.borderColor || "border-border"
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="relative z-10 space-y-6 flex-1">
                {/* Icon & Title */}
                <div className="space-y-4">
                  <div className="relative w-16 h-16 scale-125">
                    <Image
                      src={plan.imageSrc || "/coin 1.png"}
                      alt={plan.name}
                      fill
                      className="object-contain drop-shadow-md"
                      sizes="64px"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl md:text-4xl font-black text-amber-500">{plan.coins_amount}</span>
                      <span className="text-sm font-bold text-muted-foreground uppercase">Koin</span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Harga Paket:</p>
                  <p className="text-2xl font-black text-foreground">
                    Rp {Number(plan.price).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setEditingPackage(plan)}
                className={cn(
                  "mt-8 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg relative z-10 text-center cursor-pointer",
                  plan.buttonClass || "bg-amber-500 text-neutral-950 hover:bg-amber-400"
                )}
              >
                Atur Harga & Koin
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Transactions Tab */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Sub-tab Switcher for Transactions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTransactionType("topup")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border",
                transactionType === "topup"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              🪙 Top Up Koin ({coinPayments.length})
            </button>
            <button
              onClick={() => setTransactionType("films")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border",
                transactionType === "films"
                  ? "bg-brand/10 border-brand/30 text-brand"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              🎬 Pembelian Film ({filmPurchases.length})
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {transactionType === "topup" ? (
                /* Table Top Up Koin */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/80 text-foreground border-b border-border">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Paket Koin</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Nominal (Rp)</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {coinPayments.map((trx) => (
                      <tr key={trx.id || trx.order_id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-foreground">{trx.order_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-bold text-foreground">{trx.user?.name || "User"}</p>
                            <p className="text-[10px] text-muted-foreground">{trx.user?.email || "—"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-lg">
                            🪙 +{trx.coins_added || trx.package?.coins_amount || 0} Koin
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-extrabold text-foreground">
                            Rp {Number(trx.amount || 0).toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={cn(
                              "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm",
                              trx.status === "paid" || trx.status === "Success"
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500"
                                : trx.status === "pending" || trx.status === "Pending"
                                ? "bg-amber-500/15 border border-amber-500/30 text-amber-500"
                                : "bg-red-500/15 border border-red-500/30 text-red-500"
                            )}
                          >
                            {trx.status === "paid" ? "Berhasil" : trx.status === "pending" ? "Pending" : "Gagal"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-muted-foreground font-medium">{formatDate(trx.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* Table Pembelian Film */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/80 text-foreground border-b border-border">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Judul Film</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Koin Terpotong</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Masa Aktif</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Tanggal Pembelian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filmPurchases.map((acc) => (
                      <tr key={acc.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-bold text-foreground">{acc.user?.name || "User"}</p>
                            <p className="text-[10px] text-muted-foreground">{acc.user?.email || "—"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-extrabold text-brand">{acc.film?.title || "—"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-lg">
                            🪙 -{acc.coins_spent || 15} Koin
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            30 Hari (s/d {formatDate(acc.expires_at)})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-muted-foreground font-medium">{formatDate(acc.purchased_at || acc.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingPackage(null)} />
          <div className="bg-card rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-border p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-black text-foreground uppercase italic">
                Edit {editingPackage.name}
              </h3>
              <button onClick={() => setEditingPackage(null)} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                <Icon name="x" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleUpdatePackagePrice} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">Jumlah Koin</label>
                <input
                  name="coins_amount"
                  type="number"
                  min="1"
                  defaultValue={editingPackage.coins_amount}
                  className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-amber-500 text-lg font-black text-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">Harga Paket (Rupiah)</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={editingPackage.price}
                  className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-amber-500 text-lg font-black text-foreground"
                />
              </div>

              <p className="text-xs text-muted-foreground font-medium">
                Perubahan harga akan langsung berlaku untuk pembelian top up koin member.
              </p>

              <button
                type="submit"
                disabled={isSavingPackage}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {isSavingPackage ? "Memproses..." : "Simpan Perubahan Paket"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
