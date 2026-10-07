"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface Discount {
  id: number;
  packageId?: number | null;
  packageName?: string;
  label: string;
  percentage?: number | null;
  fixed_amount?: number | null;
  bonus_coins?: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const DEFAULT_COIN_PACKAGES = [
  { id: 1, name: "Paket 1 (50 Koin)", coins: 50, price: 20000 },
  { id: 2, name: "Paket 2 (120 Koin)", coins: 120, price: 45000 },
  { id: 3, name: "Paket 3 (300 Koin)", coins: 300, price: 100000 },
  { id: 4, name: "Paket 4 (620 Koin)", coins: 620, price: 200000 },
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [packages, setPackages] = useState<any[]>(DEFAULT_COIN_PACKAGES);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    packageId: "",
    label: "",
    percentage: "",
    fixed_amount: "",
    bonus_coins: "",
    valid_from: "",
    valid_until: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [discRes, pkgRes] = await Promise.all([
        api.get("/discounts").catch(() => ({ data: [] })),
        api.get("/payment/coin-packages").catch(() => ({ data: [] })),
      ]);

      if (pkgRes.data && Array.isArray(pkgRes.data) && pkgRes.data.length > 0) {
        setPackages(
          pkgRes.data.map((p: any) => ({
            id: p.id,
            name: `${p.name} (${p.coins_amount} Koin)`,
            coins: p.coins_amount,
            price: p.price,
          }))
        );
      }

      if (discRes.data && Array.isArray(discRes.data)) {
        setDiscounts(discRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch discounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      packageId: "",
      label: "",
      percentage: "",
      fixed_amount: "",
      bonus_coins: "",
      valid_from: "",
      valid_until: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPkg = packages.find((p) => String(p.id) === form.packageId);

    const payload = {
      packageId: form.packageId ? Number(form.packageId) : null,
      packageName: selectedPkg ? selectedPkg.name : "Semua Paket",
      label: form.label,
      percentage: form.percentage ? Number(form.percentage) : null,
      fixed_amount: form.fixed_amount ? Number(form.fixed_amount) : null,
      bonus_coins: form.bonus_coins ? Number(form.bonus_coins) : null,
      valid_from: form.valid_from,
      valid_until: form.valid_until,
      is_active: true,
    };

    try {
      if (editingId) {
        await api.patch(`/discounts/${editingId}`, payload).catch(() => {});
        setDiscounts((prev) =>
          prev.map((d) => (d.id === editingId ? { ...d, ...payload } : d))
        );
      } else {
        const res = await api.post("/discounts", payload).catch(() => null);
        const newDisc = res?.data || { id: Date.now(), ...payload };
        setDiscounts((prev) => [newDisc, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error("Failed to save discount", err);
    }
  };

  const handleEdit = (d: Discount) => {
    setForm({
      packageId: d.packageId ? String(d.packageId) : "",
      label: d.label || "",
      percentage: d.percentage ? String(d.percentage) : "",
      fixed_amount: d.fixed_amount ? String(d.fixed_amount) : "",
      bonus_coins: d.bonus_coins ? String(d.bonus_coins) : "",
      valid_from: d.valid_from ? d.valid_from.slice(0, 10) : "",
      valid_until: d.valid_until ? d.valid_until.slice(0, 10) : "",
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus diskon/promo ini?")) return;
    try {
      await api.delete(`/discounts/${id}`).catch(() => {});
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete discount", err);
    }
  };

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const getDiscountBadge = (d: Discount) => {
    const now = new Date();
    const start = d.valid_from ? new Date(d.valid_from) : null;
    const end = d.valid_until ? new Date(d.valid_until) : null;

    if (start && start > now) {
      return { label: "Terjadwal", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }
    if (end && end < now) {
      return { label: "Kedaluwarsa", color: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" };
    }
    return { label: "Aktif", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">
            Kelola Diskon & Promo Koin
          </h1>
          <p className="text-muted-foreground text-sm font-bold mt-1">
            Atur skema diskon, potongan harga, dan promo koin bonus untuk paket top up koin.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand/20 active:scale-95 cursor-pointer"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Tambah Diskon</span>
        </button>
      </div>

      {/* Form Card */}
      {showForm && (
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-black text-lg text-foreground uppercase italic">
              {editingId ? "Edit Diskon / Promo" : "Tambah Diskon / Promo Baru"}
            </h3>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-foreground">Target Paket Koin *</label>
              <select
                value={form.packageId}
                onChange={(e) => setForm({ ...form, packageId: e.target.value })}
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xs font-bold text-foreground"
              >
                <option value="">Semua Paket Koin</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ({formatRupiah(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-foreground">Label Promo *</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Contoh: Promo Launching 20% / Weekend Bonus Koin"
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xs text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-foreground">Diskon Potongan (%)</label>
              <input
                type="number"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                placeholder="20"
                min="0"
                max="100"
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-foreground">Atau Bonus Koin Tambahan (+Koin)</label>
              <input
                type="number"
                value={form.bonus_coins}
                onChange={(e) => setForm({ ...form, bonus_coins: e.target.value })}
                placeholder="20"
                min="0"
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-foreground">Berlaku Dari *</label>
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xs text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-foreground">Berlaku Sampai *</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-xs text-foreground"
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-xs rounded-2xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-95 cursor-pointer"
              >
                {editingId ? "Simpan Perubahan" : "Simpan Diskon Baru"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Diskon */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/80 border-b border-border text-foreground">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Paket</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider">Label Promo</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Diskon / Bonus</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Periode</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mx-auto text-muted-foreground/60">
                      <Icon name="tag" className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold">Belum ada diskon</p>
                    <p className="text-xs text-muted-foreground">Klik &quot;+ Tambah Diskon&quot; untuk membuat promo paket koin baru.</p>
                  </td>
                </tr>
              ) : (
                discounts.map((d) => {
                  const badge = getDiscountBadge(d);
                  return (
                    <tr key={d.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-foreground">
                        {d.packageName || (d.packageId ? `Paket ID #${d.packageId}` : "Semua Paket")}
                      </td>
                      <td className="px-6 py-4 text-xs font-extrabold text-brand">{d.label}</td>
                      <td className="px-6 py-4 text-center">
                        {d.percentage ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 border border-brand/20 text-brand text-xs font-black rounded-lg">
                            Diskon {d.percentage}%
                          </span>
                        ) : d.bonus_coins ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black rounded-lg">
                            🪙 +{d.bonus_coins} Koin Bonus
                          </span>
                        ) : d.fixed_amount ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-black rounded-lg">
                            {formatRupiah(d.fixed_amount)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground">
                        {d.valid_from ? new Date(d.valid_from).toLocaleDateString("id-ID") : "—"} s/d{" "}
                        {d.valid_until ? new Date(d.valid_until).toLocaleDateString("id-ID") : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border", badge.color)}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Diskon"
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Hapus Diskon"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
