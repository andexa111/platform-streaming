"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscriptionRecord {
  id: number;
  status: string;
  expired_at: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  };
  plan: {
    id: number;
    name: string;
    duration_months: number;
  };
}

export default function SubscriptionsDashboard() {
  const [activeTab, setActiveTab] = useState<"pending" | "transactions">("pending");
  const [pendingSubs, setPendingSubs] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);

  const fetchPending = async () => {
    try {
      const res = await api.get("/subscriptions/pending");
      setPendingSubs(res.data);
    } catch (err) {
      console.error("Failed to fetch pending subscriptions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pending") {
      setLoading(true);
      fetchPending();
    }
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    setApproving(id);
    try {
      await api.patch(`/subscriptions/${id}/approve`);
      fetchPending();
    } catch (err) {
      console.error("Failed to approve", err);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Yakin ingin menolak pembayaran ini?")) return;
    try {
      await api.patch(`/subscriptions/${id}/reject`);
      fetchPending();
    } catch (err) {
      console.error("Failed to reject", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Langganan & Pembayaran</h1>
          <p className="text-muted-foreground text-sm font-bold">Verifikasi pembayaran dari Midtrans dan aktifkan paket membership.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-secondary rounded-2xl border border-border shadow-inner">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === "pending" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
          >
            Menunggu Approval
            {pendingSubs.length > 0 && activeTab !== "pending" && (
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "transactions" ? "bg-card text-foreground shadow-md" : "text-muted-foreground hover:text-foreground")}
          >
            Semua Transaksi
          </button>
        </div>
      </div>

      {activeTab === "pending" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pendingSubs.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <Icon name="check" className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-foreground font-bold">Tidak ada pembayaran tertunda</p>
              <p className="text-muted-foreground text-sm mt-1">Semua membership sudah di-approve.</p>
            </div>
          ) : (
            pendingSubs.map((sub) => (
              <div key={sub.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-brand/30 transition-all shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0 text-brand font-black text-lg uppercase">
                    {sub.user.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{sub.user.name}</h4>
                    <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                  </div>
                </div>

                <div className="flex-1 md:text-center md:px-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Paket yang Dibeli</p>
                  <p className="font-bold text-brand uppercase">{sub.plan.name} <span className="text-muted-foreground">({sub.plan.duration_months} Bulan)</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waktu: {new Date(sub.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    onClick={() => handleApprove(sub.id)}
                    disabled={approving === sub.id}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-12 px-6 gap-2 text-sm uppercase tracking-wider"
                  >
                    {approving === sub.id ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Icon name="check" className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleReject(sub.id)}
                    disabled={approving === sub.id}
                    variant="outline"
                    className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold rounded-xl h-12 px-6 gap-2 text-sm uppercase tracking-wider"
                  >
                    <Icon name="x" className="w-4 h-4" />
                    Tolak
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Icon name="clock" className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-foreground font-bold">Fitur ini sedang dalam pengembangan.</p>
          <p className="text-muted-foreground text-sm mt-1">Anda dapat melihat daftar seluruh transaksi di sini nantinya.</p>
        </div>
      )}
    </div>
  );
}
