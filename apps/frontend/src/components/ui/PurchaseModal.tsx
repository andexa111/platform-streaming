"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useCoinStore } from "@/lib/coin-store";

import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  filmId: string | number;
  filmTitle: string;
  filmPrice: number;
  filmPoster?: string;
  onPurchaseSuccess?: () => void;
}

export function PurchaseModal({
  isOpen,
  onClose,
  filmId,
  filmTitle,
  filmPrice,
  filmPoster,
  onPurchaseSuccess,
}: PurchaseModalProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const storeCoins = useCoinStore((s) => s.coins);
  const coins = user?.coins ?? storeCoins;
  const unlockFilm = useCoinStore((s) => s.unlockFilm);
  const hasUnlocked = useCoinStore((s) => s.hasUnlocked);

  const [purchaseState, setPurchaseState] = React.useState<
    "confirm" | "success" | "insufficient"
  >("confirm");
  const [loading, setLoading] = React.useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPurchaseState("confirm");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canAfford = coins >= filmPrice;

  const handlePurchase = async () => {
    if (!canAfford) {
      setPurchaseState("insufficient");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/films/${filmId}/buy`);
      if (res.data?.coins_remaining !== undefined) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.setState({
            user: { ...currentUser, coins: res.data.coins_remaining },
          });
        }
      }
      unlockFilm(String(filmId), filmPrice);
      await useAuthStore.getState().checkAuth();
      setPurchaseState("success");
      setTimeout(() => {
        onPurchaseSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Purchase API failed, attempting local unlock", err);
      const success = unlockFilm(String(filmId), filmPrice);
      if (success) {
        setPurchaseState("success");
        setTimeout(() => {
          onPurchaseSuccess?.();
          onClose();
        }, 1500);
      } else {
        setPurchaseState("insufficient");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoTopup = () => {
    onClose();
    router.push("/topup");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>

        {/* === STATE: CONFIRM === */}
        {purchaseState === "confirm" && (
          <>
            {/* Coin Icon */}
            <div className="relative w-20 h-20 scale-[2]">
              <Image
                src="/coin 1.png"
                alt="Koin"
                fill
                className="object-contain drop-shadow-lg"
                sizes="80px"
              />
            </div>

            {/* Title */}
            <div className="space-y-2 pt-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                Beli Film Ini?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Untuk menonton{" "}
                <span className="font-bold text-foreground">{filmTitle}</span>,
                kamu perlu membayar dengan coin.
              </p>
            </div>

            {/* Price & Balance Info */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-brand/10 border border-brand/20">
                <span className="text-sm font-medium text-muted-foreground">
                  Harga Film
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 scale-[2]">
                    <Image
                      src="/coin 1.png"
                      alt="Koin"
                      fill
                      className="object-contain"
                      sizes="20px"
                    />
                  </div>
                  <span className="font-black text-brand text-lg">
                    {filmPrice}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-muted/30 border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Koin Kamu
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 scale-[2]">
                    <Image
                      src="/coin 1.png"
                      alt="Koin"
                      fill
                      className="object-contain"
                      sizes="20px"
                    />
                  </div>
                  <span
                    className={`font-black text-lg ${canAfford ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {coins}
                  </span>
                </div>
              </div>

              {!canAfford && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                  <Icon name="warning" className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Koin kamu tidak cukup. Kamu butuh{" "}
                    <strong>{filmPrice - coins} koin</strong> lagi.
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3 pt-2">
              {canAfford ? (
                <button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(2,77,148,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Icon name="loader-2" className="w-5 h-5 animate-spin" />
                      <span>Memproses Pembelian...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="w-5 h-5" />
                      <span>Ya, Beli Sekarang</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGoTopup}
                  className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(2,77,148,0.3)] flex items-center justify-center gap-2"
                >
                  <Icon name="plus" className="w-5 h-5" />
                  Top Up Koin
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-2xl font-bold text-sm transition-all"
              >
                Nanti Saja
              </button>
            </div>
          </>
        )}

        {/* === STATE: SUCCESS === */}
        {purchaseState === "success" && (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-in zoom-in-50 duration-500">
              <Icon name="check" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground">
                Pembelian Berhasil!
              </h3>
              <p className="text-sm text-muted-foreground">
                Selamat menonton{" "}
                <span className="font-bold text-foreground">{filmTitle}</span>.
                Film ini sekarang bisa kamu tonton kapan saja.
              </p>
            </div>
            <p className="text-xs text-muted-foreground/50 uppercase tracking-widest font-bold pt-2">
              Mengalihkan...
            </p>
          </div>
        )}

        {/* === STATE: INSUFFICIENT (fallback, handled in confirm) === */}
        {purchaseState === "insufficient" && (
          <div className="py-6 flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-in zoom-in-50 duration-500">
              <Icon name="warning" className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground">
                Koin Tidak Cukup
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kamu butuh <strong className="text-brand">{filmPrice} koin</strong> untuk menonton film ini,
                tapi koin kamu hanya tersisa <strong className="text-red-500">{coins} koin</strong>.
              </p>
            </div>
            <div className="w-full space-y-3 pt-2">
              <button
                onClick={handleGoTopup}
                className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(2,77,148,0.3)] flex items-center justify-center gap-2"
              >
                <Icon name="plus" className="w-5 h-5" />
                Top Up Koin Sekarang
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-2xl font-bold text-sm transition-all"
              >
                Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
