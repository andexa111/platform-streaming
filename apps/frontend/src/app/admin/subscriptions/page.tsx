"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

// --- Mock Data ---

const INITIAL_PLANS = [
  {
    id: "1-bulan",
    name: "1 Bulan",
    price: 50000,
    icon: "chess-pawn",
    color: "text-brand",
    borderColor: "border-brand/30",
    bgColor: "bg-brand/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonClass: "bg-brand/10 text-brand dark:text-white border border-brand/20 hover:bg-brand hover:text-white hover:border-brand shadow-brand/10",
    popular: false,
  },
  {
    id: "3-bulan",
    name: "3 Bulan",
    price: 150000,
    icon: "chess-rook",
    color: "text-[#CD7F32]",
    borderColor: "border-[#CD7F32]/30",
    bgColor: "bg-[#CD7F32]/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonClass: "bg-[#CD7F32]/10 text-[#CD7F32] dark:text-white border border-[#CD7F32]/20 hover:bg-[#CD7F32] hover:text-white hover:border-[#CD7F32] shadow-[#CD7F32]/10",
    popular: false,
  },
  {
    id: "6-bulan",
    name: "6 Bulan",
    price: 300000,
    icon: "chess-knight",
    color: "text-neutral-400 dark:text-white",
    borderColor: "border-neutral-300/80 dark:border-white/20",
    bgColor: "bg-neutral-200/20 dark:bg-white/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonClass:
      "bg-neutral-200/50 dark:bg-white/10 text-neutral-700 dark:text-white border border-neutral-300 dark:border-white/20 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 hover:border-neutral-900 dark:hover:border-white shadow-sm dark:shadow-white/5",
    popular: false,
  },
  {
    id: "1-tahun",
    name: "1 Tahun",
    price: 600000,
    icon: "chess-queen",
    color: "text-[#FFD700]",
    borderColor: "border-[#FFD700]/40 dark:border-[#FFD700]/30",
    bgColor: "bg-[#FFD700]/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonClass: "bg-[#FFD700]/10 text-[#B8860B] dark:text-white border border-[#FFD700]/20 dark:border-[#FFD700]/20 hover:bg-[#FFD700] hover:text-neutral-950 hover:border-[#FFD700] shadow-[#FFD700]/10",
    popular: false,
  },
];

const TRANSACTIONS = [
  { id: "TRXV7102", user: "andi@gmail.com", plan: "1 Tahun", amount: 600000, status: "Success", date: "2024-05-12 14:20", method: "GOPAY" },
  { id: "TRXV7103", user: "siti.rahma@yahoo.com", plan: "6 Bulan", amount: 300000, status: "Pending", date: "2024-05-12 15:45", method: "VA BCA" },
  { id: "TRXV7104", user: "budi.santoso@outlook.com", plan: "3 Bulan", amount: 150000, status: "Success", date: "2024-05-12 16:10", method: "OVO" },
  { id: "TRXV7105", user: "rara.anita@gmail.com", plan: "1 Tahun", amount: 600000, status: "Failed", date: "2024-05-11 09:30", method: "DANA" },
  { id: "TRXV7106", user: "agus88@gmail.com", plan: "6 Bulan", amount: 300000, status: "Success", date: "2024-05-11 11:15", method: "GOPAY" },
];

// --- Sub-components ---

const StatCard = ({ title, value, sub, icon, color }: any) => (
  <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
      <h3 className="text-3xl font-black text-foreground tracking-tight">{value}</h3>
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{sub}</p>
    </div>
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", color)}>
      <Icon name={icon} className="w-6 h-6" />
    </div>
  </div>
);

// --- Main Page ---

export default function SubscriptionsDashboard() {
  const [activeTab, setActiveTab] = useState<"plans" | "transactions">("plans");
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrice = Number((e.target as any).price.value);
    setPlans(plans.map((p) => (p.id === editingPlan.id ? { ...p, price: newPrice } : p)));
    setEditingPlan(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Subscriptions & Revenue</h1>
          <p className="text-muted-foreground text-sm font-bold">Atur skema paket langganan dan pantau arus kas platform.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-secondary rounded-2xl border border-border shadow-inner">
          <button
            onClick={() => setActiveTab("plans")}
            className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "plans" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
          >
            Pricing Plans
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "transactions" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value="Rp 8.4M" sub="+12% VS LAST MONTH" icon="play" color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Active Subs" value="1,240" sub="FROM 4.2K USERS" icon="eye" color="bg-brand/10 text-brand" />
        <StatCard title="Churn Rate" value="2.4%" sub="GOOD RETENTION" icon="play" color="bg-purple-50 text-purple-600" />
      </div> */}

      {/* Main Content Areas */}
      {activeTab === "plans" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "group relative p-6 md:p-8 rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden",
                plan.borderColor,
                plan.popular
                  ? "bg-neutral-50 dark:bg-neutral-900/80 z-20 shadow-2xl shadow-neutral-950/5 dark:shadow-white/5 border-neutral-300 dark:border-neutral-800"
                  : "bg-neutral-50/40 hover:bg-neutral-100/60 dark:bg-neutral-900/40 dark:hover:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800/30",
              )}
            >
              {/* Card Decoration */}
              <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12">
                <Icon name={plan.icon as any} className="w-32 h-32 md:w-40 md:h-40" />
              </div>

              <div className="relative z-10 space-y-6 flex-1">
                {/* Header */}
                <div className="space-y-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner", plan.bgColor)}>
                    <Icon name={plan.icon as any} className={cn("w-6 h-6", plan.color)} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">Rp {plan.price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Apa yang didapat:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 group/item">
                        <div className={cn("mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border border-neutral-200 dark:border-white/10 group-hover/item:border-brand transition-colors", plan.bgColor)}>
                          <Icon name="check" className={cn("w-2.5 h-2.5", plan.color)} />
                        </div>
                        <span className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 font-medium group-hover/item:text-neutral-900 dark:group-hover/item:text-white transition-colors">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setEditingPlan(plan)}
                className={cn("mt-8 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95 shadow-xl relative z-10 text-center", plan.buttonClass)}
              >
                Atur Harga
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand text-white">
                  <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide">Order ID</th>
                  <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide">User / Identity</th>
                  <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide text-center">Package</th>
                  <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide text-center">Amount</th>
                  <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide text-center">Status</th>
                  <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TRANSACTIONS.map((trx) => (
                  <tr key={trx.id} className="hover:bg-secondary/50 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-[15px] font-bold text-foreground">{trx.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center font-black text-xs text-brand uppercase shadow-sm">{trx.user.charAt(0)}</div>
                        <p className="text-[15px] font-bold text-foreground">{trx.user}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[12px] font-black px-3 py-1 bg-secondary rounded-lg text-foreground uppercase tracking-wider">{trx.plan}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-[15px] font-black text-foreground">Rp {trx.amount.toLocaleString("id-ID")}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm",
                          trx.status === "Success" ? "bg-emerald-500 text-white" : trx.status === "Pending" ? "bg-amber-500 text-white" : "bg-red-500 text-white",
                        )}
                      >
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[13px] font-bold text-muted-foreground uppercase">{trx.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-border bg-secondary/30">
            <button className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Lihat Seluruh Riwayat Transaksi →</button>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingPlan(null)} />
          <div className="bg-card rounded-[2rem] w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground uppercase italic">Update Harga {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                <Icon name="x" className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleUpdatePrice} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Harga Per Bulan (IDR)</label>
                <input
                  autoFocus
                  name="price"
                  type="number"
                  defaultValue={editingPlan.price}
                  className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xl font-black italic text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Perubahan harga akan langsung berdampak pada penawaran di halaman member.</p>
              <button type="submit" className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all">
                Simpan Harga Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
