"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface Discount {
  id: number;
  planId: number;
  label: string;
  percentage: number | null;
  fixed_amount: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  plan: { id: number; name: string; slug: string; price: number };
}

interface MembershipPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    planId: "",
    label: "",
    percentage: "",
    fixed_amount: "",
    valid_from: "",
    valid_until: "",
  });

  const fetchData = async () => {
    try {
      const [discRes, planRes] = await Promise.all([
        api.get("/discounts"),
        api.get("/membership-plans/admin"),
      ]);
      setDiscounts(discRes.data);
      setPlans(planRes.data);
    } catch (err) {
      console.error("Failed to fetch discounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ planId: "", label: "", percentage: "", fixed_amount: "", valid_from: "", valid_until: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      planId: Number(form.planId),
      label: form.label,
      percentage: form.percentage ? Number(form.percentage) : undefined,
      fixed_amount: form.fixed_amount ? Number(form.fixed_amount) : undefined,
      valid_from: form.valid_from,
      valid_until: form.valid_until,
    };

    try {
      if (editingId) {
        await api.patch(`/discounts/${editingId}`, payload);
      } else {
        await api.post("/discounts", payload);
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Failed to save discount", err);
    }
  };

  const handleEdit = (d: Discount) => {
    setForm({
      planId: String(d.planId),
      label: d.label,
      percentage: d.percentage ? String(d.percentage) : "",
      fixed_amount: d.fixed_amount ? String(d.fixed_amount) : "",
      valid_from: d.valid_from?.slice(0, 10) || "",
      valid_until: d.valid_until?.slice(0, 10) || "",
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus diskon ini?")) return;
    try {
      await api.delete(`/discounts/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete discount", err);
    }
  };

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Kelola Diskon</h1>
          <p className="text-muted-foreground mt-1">Atur diskon untuk paket membership</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-brand hover:brightness-110 text-white font-bold rounded-xl h-12 px-6 gap-2"
        >
          <Icon name="plus" className="w-5 h-5" />
          Tambah Diskon
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-foreground">{editingId ? "Edit Diskon" : "Diskon Baru"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Paket</label>
              <select
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
                className="w-full h-12 rounded-xl bg-muted/50 border border-border px-4 text-foreground"
                required
              >
                <option value="">Pilih paket</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.price)})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Label</label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Promo Launching" className="h-12 bg-muted/50 border-border" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Diskon (%)</label>
              <Input type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                placeholder="20" className="h-12 bg-muted/50 border-border" min="0" max="100" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Atau Potongan (Rp)</label>
              <Input type="number" value={form.fixed_amount} onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })}
                placeholder="5000" className="h-12 bg-muted/50 border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Berlaku Dari</label>
              <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                className="h-12 bg-muted/50 border-border" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Berlaku Sampai</label>
              <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="h-12 bg-muted/50 border-border" required />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <Button type="submit" className="bg-brand text-white font-bold rounded-xl h-12 px-6">
                {editingId ? "Simpan Perubahan" : "Tambah Diskon"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-12 px-6">
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Diskon */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Paket</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Label</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Diskon</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Periode</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {discounts.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Belum ada diskon</td></tr>
            ) : discounts.map((d) => (
              <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{d.plan.name}</td>
                <td className="px-6 py-4 text-sm text-foreground">{d.label}</td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {d.percentage ? `${d.percentage}%` : d.fixed_amount ? formatRupiah(d.fixed_amount) : "-"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(d.valid_from).toLocaleDateString("id-ID")} — {new Date(d.valid_until).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(d)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Icon name="edit" className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                      <Icon name="trash" className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
