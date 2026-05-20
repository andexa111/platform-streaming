"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonAction } from "@/components/ui/ButtonAction";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const INITIAL_USERS = [
  { id: 1, name: "Andi Wijaya", email: "andi@sinea.id", role: "Super Admin", status: "Active", plan: "Free", joined: "2024-01-12" },
  { id: 2, name: "Siti Rahma", email: "siti@gmail.com", role: "Admin", status: "Active", plan: "Silver", joined: "2024-02-15" },
  { id: 3, name: "Budi Santoso", email: "budi.s@yahoo.com", role: "User", status: "Suspended", plan: "Gold", joined: "2024-03-01" },
  { id: 4, name: "Dewi Lestari", email: "dewi@sinea.id", role: "Admin", status: "Active", plan: "Free", joined: "2024-03-10" },
  { id: 5, name: "Rian Pratama", email: "rian.p@outlook.com", role: "User", status: "Active", plan: "Bronze", joined: "2024-04-05" },
];

const ROLES = ["User", "Admin", "Super Admin"];
const PLANS = ["Free", "Bronze", "Silver", "Gold"];

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
    "Super Admin": "bg-foreground text-background",
    "Admin": "bg-purple-500/20 text-purple-500 border border-purple-500/20",
    "User": "bg-brand/20 text-brand border border-brand/20",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap", styles[role] || "bg-secondary text-muted-foreground")}>
      {role}
    </span>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: any = {
    "Gold": "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    "Silver": "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20",
    "Bronze": "bg-orange-500/10 text-orange-500 border border-orange-500/20",
    "Free": "bg-secondary text-muted-foreground border border-border",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter", styles[plan])}>
      {plan}
    </span>
  );
};

// --- Main Page ---

export default function UsersManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  
  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === "All" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const handleToggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus pengguna ini secara permanen?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleAddEdit = (e: any) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const result = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      role: data.get("role") as string,
      plan: data.get("plan") as string,
    };

    if (currentUser) {
      setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...result } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...result, status: "Active", joined: new Date().toISOString().split("T")[0] } as any]);
    }
    setIsAddEditOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Manajemen User</h1>
          <p className="text-muted-foreground text-sm font-bold">Kelola hak akses, reset password, dan pantau status pelanggan.</p>
        </div>
        <button 
          onClick={() => { setCurrentUser(null); setIsAddEditOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 whitespace-nowrap"
        >
          <Icon name="user-plus" className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs font-black">Tambah Admin/User</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-card rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Icon name="user" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">Total Members</p>
            <h4 className="text-2xl font-black text-foreground">{users.filter(u => u.role === "User").length}</h4>
          </div>
        </div>
        <div className="p-6 bg-card rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Icon name="settings" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground">Moderators</p>
            <h4 className="text-2xl font-black text-foreground">{users.filter(u => u.role !== "User").length}</h4>
          </div>
        </div>
        <div className="p-6 bg-card rounded-3xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Icon name="star" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Subs</p>
            <h4 className="text-2xl font-black text-foreground">{users.filter(u => u.plan !== "Free").length}</h4>
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
              <option value="All" className="bg-card">Semua Role</option>
              {ROLES.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand text-white">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">User Identity</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Role</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Plan</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar Mock */}
                      <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-black text-brand text-xs uppercase shadow-sm">
                        {user.name.charAt(0)}
                      </div>
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
                    <PlanBadge plan={user.plan} />
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      className="flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg hover:bg-secondary transition-all"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
                      <span className="text-[10px] font-black uppercase text-foreground">{user.status}</span>
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <ButtonAction 
                      onReset={() => { setCurrentUser(user); setIsResetOpen(true); }}
                      onEdit={() => { setCurrentUser(user); setIsAddEditOpen(true); }}
                      onDelete={() => handleDelete(user.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <Modal 
        isOpen={isAddEditOpen} 
        onClose={() => setIsAddEditOpen(false)} 
        title={currentUser ? "Edit Informasi User" : "Daftarkan User Baru"}
      >
        <form onSubmit={handleAddEdit} className="space-y-6">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
              <div className="relative group">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required={!currentUser} 
                  placeholder={currentUser ? "Kosongkan jika tidak ingin mengubah" : "••••••••"} 
                  className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand text-sm font-bold text-foreground placeholder:text-muted-foreground" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role Platform</label>
                <select name="role" defaultValue={currentUser?.role || "User"} className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand text-sm font-bold appearance-none text-foreground">
                  {ROLES.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subscription Plan</label>
                <select name="plan" defaultValue={currentUser?.plan || "Free"} className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand text-sm font-bold appearance-none text-foreground">
                  {PLANS.map(p => <option key={p} value={p} className="bg-card">{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all">
            {currentUser ? "Update Data User" : "Buat Akun Sekarang"}
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
            <p className="text-sm font-medium text-muted-foreground">Anda akan mengatur ulang password untuk akun:</p>
            <p className="text-lg font-black text-foreground uppercase italic">{currentUser?.email}</p>
          </div>
          <div className="p-4 bg-secondary rounded-2xl border border-border">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Generated Password</p>
            <p className="text-xl font-black text-emerald-500 tracking-widest">SINEA123!</p>
          </div>
          <button 
            onClick={() => { alert("Password telah di-reset ke: SINEA123!"); setIsResetOpen(false); }}
            className="w-full py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:opacity-90"
          >
            Konfirmasi & Kirim Email
          </button>
        </div>
      </Modal>
    </div>
  );
}
