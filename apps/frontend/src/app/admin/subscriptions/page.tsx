"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

// --- Mock Data ---

const INITIAL_PLANS = [
  { id: "bronze", name: "Bronze", price: 29000, description: "Kualitas HD, 1 Perangkat", color: "from-orange-500/10 to-transparent", border: "border-orange-500/30" },
  { id: "silver", name: "Silver", price: 59000, description: "Kualitas Full HD, 2 Perangkat", color: "from-neutral-400/10 to-transparent", border: "border-neutral-400/40" },
  { id: "gold", name: "Gold", price: 99000, description: "Kualitas 4K + HDR, 4 Perangkat", color: "from-amber-400/10 to-transparent", border: "border-amber-500/40" },
];

const TRANSACTIONS = [
  { id: "TRXV7102", user: "andi@gmail.com", plan: "Gold", amount: 99000, status: "Success", date: "2024-05-12 14:20", method: "GOPAY" },
  { id: "TRXV7103", user: "siti.rahma@yahoo.com", plan: "Silver", amount: 59000, status: "Pending", date: "2024-05-12 15:45", method: "VA BCA" },
  { id: "TRXV7104", user: "budi.santoso@outlook.com", plan: "Bronze", amount: 29000, status: "Success", date: "2024-05-12 16:10", method: "OVO" },
  { id: "TRXV7105", user: "rara.anita@gmail.com", plan: "Gold", amount: 99000, status: "Failed", date: "2024-05-11 09:30", method: "DANA" },
  { id: "TRXV7106", user: "agus88@gmail.com", plan: "Silver", amount: 59000, status: "Success", date: "2024-05-11 11:15", method: "GOPAY" },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {plans.map((plan) => (
            <div key={plan.id} className={cn("bg-card rounded-[2.5rem] border p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all relative overflow-hidden group", plan.border)}>
              {/* Visual Decorative */}
              <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl blur-[40px] opacity-60", plan.color)} />

              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <h4 className="text-4xl font-black text-foreground italic tracking-tighter uppercase">{plan.name}</h4>
                  {/* <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{plan.description}</p> */}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted-foreground italic">Rp</span>
                  <p className="text-5xl font-black text-foreground italic tracking-tighter">{plan.price.toLocaleString("id-ID")}</p>
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">/mo</span>
                </div>

                <div className="space-y-3 pt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 opacity-60">
                      <Icon name="chevron-right" className="w-3 h-3 text-brand" />
                      <span className="text-xs font-bold text-muted-foreground">Feature Benefit #0{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* <button
                onClick={() => setEditingPlan(plan)}
                className="mt-10 w-full py-4 bg-neutral-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 group-hover:bg-brand group-hover:shadow-brand/20 active:scale-95"
              >
                Atur Harga
              </button> */}
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
