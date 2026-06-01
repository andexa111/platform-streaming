"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonAction } from "@/components/ui/ButtonAction";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

// --- Types ---
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  email_verified_at?: string;
  createdAt: string;
  activePlan: string | null;
  activePlanSlug: string | null;
  subExpiredAt: string | null;
}

const ROLES_FILTER = ["All", "superadmin", "admin", "subscriber", "user", "guest"];
const ROLES_OPTIONS = ["guest", "user", "subscriber", "admin", "superadmin"];

// --- Sub-components ---

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        <div className="p-6 md:p-8 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-black text-foreground uppercase italic">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <Icon name="x" className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const styles: any = {
    superadmin: "bg-foreground text-background",
    admin: "bg-purple-500/20 text-purple-500 border border-purple-500/20",
    subscriber: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20",
    user: "bg-brand/20 text-brand border border-brand/20",
    guest: "bg-secondary text-muted-foreground border border-border",
  };
  const labels: any = {
    superadmin: "Super Admin",
    admin: "Admin",
    subscriber: "Subscriber",
    user: "User",
    guest: "Guest",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap", styles[role] || "bg-secondary text-muted-foreground")}>
      {labels[role] || role}
    </span>
  );
};

const PlanBadge = ({ plan }: { plan: string | null }) => {
  if (!plan) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-secondary text-muted-foreground border border-border">
        Free
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-500 border border-amber-500/20">
      {plan}
    </span>
  );
};

// --- Main Page ---

export default function UsersManagementPage() {
  const { user: sessionUser } = useAuthStore();
  const isSuperAdmin = sessionUser?.role === "superadmin";

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  
  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetResult, setResetResult] = useState("");

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
      setError("");
    } catch (err: any) {
      console.error("Gagal memuat data users:", err);
      setError("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === "All" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  // Stats
  const stats = useMemo(() => ({
    totalMembers: users.filter(u => u.role === "subscriber" || u.role === "user" || u.role === "guest").length,
    totalAdmins: users.filter(u => u.role === "admin" || u.role === "superadmin").length,
    activeSubs: users.filter(u => u.activePlan !== null).length,
  }), [users]);

  // --- Handlers (superadmin only) ---

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      const data = new FormData(e.currentTarget);
      await api.patch(`/users/${currentUser.id}`, {
        name: data.get("name"),
        email: data.get("email"),
        role: data.get("role"),
      });
      await fetchUsers();
      setIsEditOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const res = await api.post(`/users/${currentUser.id}/reset-password`);
      setResetResult(res.data.defaultPassword || "SINEA123!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mereset password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await api.delete(`/users/${currentUser.id}`);
      await fetchUsers();
      setIsDeleteOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus user.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <Icon name="warning" className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-500 font-bold">{error}</p>
        <button onClick={fetchUsers} className="text-brand font-bold text-sm underline">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Manajemen User</h1>
          <p className="text-muted-foreground text-sm font-bold">
            {isSuperAdmin 
              ? "Kelola hak akses, reset password, dan pantau status pelanggan." 
              : "Lihat data pengguna platform. Hanya superadmin yang dapat mengedit."}
          </p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Icon name="user" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">Total Members</p>
            <h4 className="text-2xl font-black text-foreground">{stats.totalMembers}</h4>
          </div>
        </div>
        <div className="p-6 bg-card rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Icon name="settings" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">Admin / Moderator</p>
            <h4 className="text-2xl font-black text-foreground">{stats.totalAdmins}</h4>
          </div>
        </div>
        <div className="p-6 bg-card rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Icon name="star" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Subs</p>
            <h4 className="text-2xl font-black text-foreground">{stats.activeSubs}</h4>
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-xs font-black uppercase focus:outline-none focus:border-brand hidden sm:block shadow-sm text-foreground"
            >
              {ROLES_FILTER.map(r => <option key={r} value={r} className="bg-card">{r === "All" ? "Semua Role" : r}</option>)}
            </select>
          </div>
          <div className="text-xs text-muted-foreground font-bold">
            {filteredUsers.length} dari {users.length} user
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand text-white">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">User</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Role</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Plan</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Terdaftar</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Email</th>
                {isSuperAdmin && <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                        <Icon name="user" className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-bold text-sm">
                        {searchQuery || selectedRole !== "All" ? "Tidak ada user yang cocok." : "Belum ada data user."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-black text-brand text-xs uppercase shadow-sm">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-foreground">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-8 py-5 text-center">
                    <PlanBadge plan={user.activePlan} />
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[11px] text-muted-foreground font-bold">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {user.email_verified_at ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">Verified</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">Unverified</span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-8 py-5">
                      <ButtonAction 
                        onReset={() => { setCurrentUser(user); setResetResult(""); setIsResetOpen(true); }}
                        onEdit={() => { setCurrentUser(user); setIsEditOpen(true); }}
                        onDelete={() => { setCurrentUser(user); setIsDeleteOpen(true); }}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit User */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        title="Edit User"
      >
        <form onSubmit={handleEdit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
              <input name="name" defaultValue={currentUser?.name} required placeholder="Nama User" className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand text-sm font-bold text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
              <input name="email" type="email" defaultValue={currentUser?.email} required placeholder="email@user.com" className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand text-sm font-bold text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role Platform</label>
              <select name="role" defaultValue={currentUser?.role || "user"} className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand text-sm font-bold appearance-none text-foreground">
                {ROLES_OPTIONS.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className={cn(
              "w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand/20 transition-all",
              saving ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"
            )}
          >
            {saving ? "Menyimpan..." : "Update Data User"}
          </button>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Password"
      >
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
            <Icon name="warning" className="w-10 h-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {resetResult ? "Password berhasil di-reset untuk:" : "Anda akan mengatur ulang password untuk akun:"}
            </p>
            <p className="text-lg font-black text-foreground uppercase italic">{currentUser?.email}</p>
          </div>
          {resetResult ? (
            <>
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">New Password</p>
                <p className="text-xl font-black text-emerald-500 tracking-widest">{resetResult}</p>
              </div>
              <button 
                onClick={() => setIsResetOpen(false)}
                className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:opacity-90"
              >
                Selesai
              </button>
            </>
          ) : (
            <>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Password Baru</p>
                <p className="text-xl font-black text-emerald-500 tracking-widest">SINEA123!</p>
              </div>
              <button 
                onClick={handleResetPassword}
                disabled={saving}
                className={cn(
                  "w-full py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                  saving ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                )}
              >
                {saving ? "Memproses..." : "Konfirmasi Reset Password"}
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Modal Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus User"
      >
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Icon name="trash" className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Anda akan menghapus akun secara permanen:</p>
            <p className="text-lg font-black text-foreground uppercase italic">{currentUser?.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
          </div>
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
            <p className="text-xs text-red-500 font-bold">Tindakan ini tidak dapat dibatalkan. Semua data user termasuk riwayat tontonan dan langganan akan dihapus.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-muted"
            >
              Batal
            </button>
            <button 
              onClick={handleDelete}
              disabled={saving}
              className={cn(
                "flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                saving ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
              )}
            >
              {saving ? "Menghapus..." : "Hapus Permanen"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
