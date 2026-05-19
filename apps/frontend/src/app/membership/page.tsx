"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const TIER_ICONS = ["chess-pawn", "chess-rook", "chess-knight", "chess-queen"];
const TIER_COLORS = [
  { color: "text-[#CD7F32]", borderColor: "border-[#CD7F32]/30", bgColor: "bg-[#CD7F32]/5" },
  { color: "text-white", borderColor: "border-white/20", bgColor: "bg-white/5" },
  { color: "text-[#C0C0C0]", borderColor: "border-[#C0C0C0]/30", bgColor: "bg-[#C0C0C0]/5" },
  { color: "text-[#FFD700]", borderColor: "border-[#FFD700]/30", bgColor: "bg-[#FFD700]/5" },
];

interface Plan {
  id: number;
  slug: string;
  name: string;
  price: number;
  duration_months: number;
  discounted_price: number | null;
  discount: { label: string; percentage: number | null; valid_until: string } | null;
  benefits: string[];
  max_devices: number;
  quality: string;
}

export default function MembershipPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/membership-plans")
      .then((res) => setPlans(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChoosePlan = async (planId: number) => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await api.post("/payment/checkout", { planId });
      if (res.data.redirect_url) {
        window.location.href = res.data.redirect_url;
      }
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Gagal memproses pembayaran. Coba lagi.");
    }
  };

  const formatRupiah = (n: number) => `${(n / 1000).toFixed(0)}K`;

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const popularIndex = plans.length >= 3 ? 2 : plans.length - 1; // Paket 3 paling popular

  return (
    <div className="bg-background min-h-screen text-foreground pb-32 selection:bg-brand/30 font-sans">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-all group"
          >
            <Icon name="arrow-right" className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => router.push("/")}>Home</span>
            <Icon name="chevron-right" className="w-3 h-3" />
            <span className="text-brand">Membership</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent -z-10" />
        <div className="max-w-4xl px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-xs font-bold text-brand uppercase tracking-widest">
            <Icon name="crown" className="w-4 h-4" />
            Sinea VIP Membership
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">Pilih Paket</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500">Hiburan Tanpa Batas</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Nikmati ribuan karya sinematik eksklusif dengan kualitas terbaik. Upgrade kapan saja, batalkan kapan saja.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6">
        <div className={cn("grid gap-8", plans.length <= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4")}>
          {plans.map((plan, index) => {
            const tier = TIER_COLORS[index % TIER_COLORS.length];
            const icon = TIER_ICONS[index % TIER_ICONS.length];
            const isPopular = index === popularIndex;

            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative p-8 md:p-10 rounded-[3rem] border transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden",
                  tier.borderColor,
                  isPopular ? "bg-card scale-105 z-20 shadow-2xl" : "bg-card/50 hover:bg-card/80 shadow-sm",
                )}
              >
                {isPopular && (
                  <div className="absolute top-6 right-8 px-4 py-1.5 rounded-full bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Terpopuler
                  </div>
                )}

                {/* Discount Badge */}
                {plan.discount && (
                  <div className="absolute top-6 left-8 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {plan.discount.percentage ? `-${plan.discount.percentage}%` : plan.discount.label}
                  </div>
                )}

                <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12">
                  <Icon name={icon as any} className="w-48 h-48" />
                </div>

                <div className="relative z-10 space-y-8 flex-1">
                  <div className="space-y-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-border shadow-inner", tier.bgColor)}>
                      <Icon name={icon as any} className={cn("w-7 h-7", tier.color)} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase italic tracking-tight text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline gap-2">
                        {plan.discounted_price != null ? (
                          <>
                            <span className="text-lg font-bold text-muted-foreground line-through">Rp {formatRupiah(plan.price)}</span>
                            <span className="text-4xl font-black text-foreground">Rp {formatRupiah(plan.discounted_price)}</span>
                          </>
                        ) : (
                          <span className="text-4xl font-black text-foreground">Rp {formatRupiah(plan.price)}</span>
                        )}
                        <span className="text-muted-foreground font-bold">/ {plan.duration_months} bulan</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Apa yang didapat:</p>
                    <ul className="space-y-4">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 group/item">
                          <div className={cn("mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border border-border", tier.bgColor)}>
                            <Icon name="check" className={cn("w-3 h-3", tier.color)} />
                          </div>
                          <span className="text-sm md:text-base text-muted-foreground font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  className={cn(
                    "mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl relative z-10",
                    isPopular
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-secondary hover:bg-secondary/80 border border-border text-foreground shadow-sm",
                  )}
                >
                  Pilih Paket
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-6 mt-32 text-center space-y-12">
        <h2 className="text-3xl font-bold uppercase italic tracking-tight">Kenapa Harus Sinea?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "star", title: "Konten Eksklusif", desc: "Film dan dokumenter yang hanya ada di Sinea." },
            { icon: "smartphone", title: "Multi Perangkat", desc: "Tonton di HP, tablet, laptop, atau smart TV." },
            { icon: "download", title: "Download Offline", desc: "Simpan film favorit dan tonton tanpa internet." },
            { icon: "shield-check", title: "Aman & Terpercaya", desc: "Pembayaran aman melalui gateway resmi." },
          ].map((item, i) => (
            <div key={i} className="space-y-4 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary border border-border flex items-center justify-center group-hover:scale-110 group-hover:border-brand transition-all duration-500 shadow-inner">
                <Icon name={item.icon as any} className="w-7 h-7 text-brand" />
              </div>
              <div className="space-y-1 text-foreground">
                <h4 className="font-bold text-sm uppercase">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
