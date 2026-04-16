"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const INITIAL_USERS = [
  { id: 1, name: "Andi Wijaya", email: "andi@lalakon.id", role: "Super Admin", status: "Active", plan: "Free", joined: "2024-01-12" },
  { id: 2, name: "Siti Rahma", email: "siti@gmail.com", role: "Admin", status: "Active", plan: "Silver", joined: "2024-02-15" },
  { id: 3, name: "Budi Santoso", email: "budi.s@yahoo.com", role: "User", status: "Suspended", plan: "Gold", joined: "2024-03-01" },
  { id: 4, name: "Dewi Lestari", email: "dewi@lalakon.id", role: "Admin", status: "Active", plan: "Free", joined: "2024-03-10" },
  { id: 5, name: "Rian Pratama", email: "rian.p@outlook.com", role: "User", status: "Active", plan: "Bronze", joined: "2024-04-05" },
];

const ROLES = ["User", "Admin", "Super Admin"];
const PLANS = ["Free", "Bronze", "Silver", "Gold"];

// --- Sub-components ---

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-neutral-900 uppercase italic">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-50 rounded-xl transition-colors">
            <Icon name="x" className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const styles: any = {
    "Super Admin": "bg-neutral-900 text-white",
    "Admin": "bg-purple-100 text-purple-700",
    "User": "bg-blue-50 text-blue-600",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap", styles[role] || "bg-neutral-100 text-neutral-500")}>
      {role}
    </span>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const styles: any = {
    "Gold": "bg-amber-100 text-amber-700 border border-amber-200",
    "Silver": "bg-neutral-100 text-neutral-600 border border-neutral-200",
    "Bronze": "bg-orange-100 text-orange-700 border border-orange-200",
    "Free": "bg-neutral-50 text-neutral-400 border border-neutral-100",
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
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Manajemen User</h1>
          <p className="text-neutral-500 text-sm font-medium">Kelola hak akses, reset password, dan pantau status pelanggan.</p>
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
        <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon name="user" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-neutral-400">Total Members</p>
            <h4 className="text-2xl font-black text-neutral-900">{users.filter(u => u.role === "User").length}</h4>
          </div>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Icon name="settings" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-neutral-400">Moderators</p>
            <h4 className="text-2xl font-black text-neutral-900">{users.filter(u => u.role !== "User").length}</h4>
          </div>
        </div>
        <div className="p-6 bg-emerald-950 text-white rounded-3xl shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand/30 blur-2xl" />
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Icon name="star" className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Active Subs</p>
            <h4 className="text-2xl font-black text-white">{users.filter(u => u.plan !== "Free").length}</h4>
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="bg-white rounded-[2rem] border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-brand transition-all"
              />
            </div>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-black uppercase focus:outline-none focus:border-brand hidden sm:block shadow-sm"
            >
              <option value="All">Semua Role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">User Identity</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Role</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Plan</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar Mock */}
                      <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-brand text-xs uppercase shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{user.name}</p>
                        <p className="text-[11px] text-neutral-400 font-medium">{user.email}</p>
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
                      className="flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-all"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
                      <span className="text-[10px] font-black uppercase text-neutral-600">{user.status}</span>
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setCurrentUser(user); setIsResetOpen(true); }}
                        className="p-2.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                        title="Reset Password"
                      >
                        <Icon name="star" className="w-4 h-4" /> {/* Use as reset icon */}
                      </button>
                      <button 
                        onClick={() => { setCurrentUser(user); setIsAddEditOpen(true); }}
                        className="p-2.5 text-neutral-400 hover:text-brand hover:bg-brand/5 rounded-xl transition-all" 
                        title="Edit User"
                      >
                        <Icon name="settings" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                        title="Delete User"
                      >
                        <Icon name="x" className="w-4 h-4" />
                      </button>
                    </div>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nama Lengkap</label>
              <input name="name" defaultValue={currentUser?.name} required placeholder="Nama User" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand text-sm font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Address</label>
              <input name="email" type="email" defaultValue={currentUser?.email} required placeholder="email@user.com" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Role Platform</label>
                <select name="role" defaultValue={currentUser?.role || "User"} className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand text-sm font-bold appearance-none">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Subscription Plan</label>
                <select name="plan" defaultValue={currentUser?.plan || "Free"} className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand text-sm font-bold appearance-none">
                  {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
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
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <Icon name="star" className="w-10 h-10 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Anda akan mengatur ulang password untuk akun:</p>
            <p className="text-lg font-black text-neutral-900 uppercase italic">{currentUser?.email}</p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Generated Password</p>
            <p className="text-xl font-black text-emerald-600 tracking-widest">LALAKON123!</p>
          </div>
          <button 
            onClick={() => { alert("Password telah di-reset ke: LALAKON123!"); setIsResetOpen(false); }}
            className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-neutral-800"
          >
            Konfirmasi & Kirim Email
          </button>
        </div>
      </Modal>
    </div>
  );
}
