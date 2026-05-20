"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    name: "1 Bulan",
    price: "50K",
    period: "",
    icon: "chess-pawn",
    color: "text-brand",
    borderColor: "border-brand/30",
    bgColor: "bg-brand/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: false,
    buttonClass: "bg-brand/10 text-brand dark:text-white border border-brand/20 hover:bg-brand hover:text-white hover:border-brand shadow-brand/10",
  },
  {
    name: "3 Bulan",
    price: "150K",
    period: "",
    icon: "chess-rook",
    color: "text-[#CD7F32]",
    borderColor: "border-[#CD7F32]/30",
    bgColor: "bg-[#CD7F32]/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: false,
    buttonClass: "bg-[#CD7F32]/10 text-[#CD7F32] dark:text-white border border-[#CD7F32]/20 hover:bg-[#CD7F32] hover:text-white hover:border-[#CD7F32] shadow-[#CD7F32]/10",
  },
  {
    name: "6 Bulan",
    price: "300K",
    period: "",
    icon: "chess-knight",
    color: "text-neutral-400 dark:text-white",
    borderColor: "border-neutral-300/80 dark:border-white/20",
    bgColor: "bg-neutral-200/20 dark:bg-white/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: true,
    buttonClass: "bg-neutral-200/50 dark:bg-white/10 text-neutral-700 dark:text-white border border-neutral-300 dark:border-white/20 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 hover:border-neutral-900 dark:hover:border-white shadow-sm dark:shadow-white/5",
  },
  {
    name: "1 Tahun",
    price: "600K",
    period: "",
    icon: "chess-queen",
    color: "text-[#FFD700]",
    borderColor: "border-[#FFD700]/40 dark:border-[#FFD700]/30",
    bgColor: "bg-[#FFD700]/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: false,
    buttonClass: "bg-[#FFD700]/10 text-[#B8860B] dark:text-white border border-[#FFD700]/20 dark:border-[#FFD700]/20 hover:bg-[#FFD700] hover:text-neutral-950 hover:border-[#FFD700] shadow-[#FFD700]/10",
  },
];

export default function MembershipPage() {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen text-neutral-900 dark:text-white pb-32 selection:bg-brand/30 font-sans transition-colors duration-300">
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex items-center gap-4 relative z-50">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 transition-all group"
        >
          <Icon name="arrow-right" className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
          <span className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/')}>Home</span>
          <Icon name="chevron-right" className="w-3 h-3" />
          <span className="text-brand">Membership</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent -z-10" />

        <div className="max-w-4xl px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-brand uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <Icon name="crown" className="w-4 h-4" />
            Sinea VIP Membership
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">Pilih Paket</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500">Hiburan Tanpa Batas</span>
          </h1>

          <p className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">Nikmati ribuan karya sinematik eksklusif dengan kualitas terbaik. Upgrade kapan saja, batalkan kapan saja.</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-[90rem] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "group relative p-6 md:p-8 rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden",
                plan.borderColor,
                "bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 shadow-2xl shadow-neutral-950/5 dark:shadow-white/5",
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
                      <span className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">Rp {plan.price}</span>
                      {plan.period && <span className="text-neutral-500 font-bold">{plan.period}</span>}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Apa yang didapat:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
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
                className={cn(
                  "mt-8 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95 shadow-xl relative z-10",
                  plan.buttonClass,
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges / Comparison */}
      <section className="max-w-7xl mx-auto px-6 mt-32 text-center space-y-12">
        <h2 className="text-3xl font-bold uppercase italic tracking-tight">Kenapa Harus Sinea?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "star", title: "Lorem Ipsum", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
            { icon: "smartphone", title: "Dolor Sit Amet", desc: "Ut enim ad minim veniam, quis nostrud exercitation." },
            { icon: "download", title: "Consectetur", desc: "Duis aute irure dolor in reprehenderit in voluptate." },
            { icon: "shield-check", title: "Adipiscing Elit", desc: "Excepteur sint occaecat cupidatat non proident." },
          ].map((item, i) => (
            <div key={i} className="space-y-4 group">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-brand transition-all duration-500 shadow-inner">
                <Icon name={item.icon as any} className="w-7 h-7 text-brand" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm uppercase">{item.title}</h4>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 mt-40 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black uppercase italic tracking-tight">Pertanyaan Umum</h2>
          <p className="text-neutral-500">Semua yang perlu Anda ketahui tentang Sinea Membership.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Lorem ipsum dolor sit amet?",
              a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            },
            {
              q: "Consectetur adipiscing elit sed do?",
              a: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            },
            {
              q: "Sed do eiusmod tempor incididunt?",
              a: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
            },
            {
              q: "Ut enim ad minim veniam quis?",
              a: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
            },
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/10 transition-all group shadow-sm dark:shadow-none">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2 flex items-center justify-between">
                {faq.q}
                <Icon name="chevron-right" className="w-4 h-4 text-neutral-400 dark:text-neutral-600 group-hover:rotate-90 transition-transform" />
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
