"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  const fetchAll = async () => {
    try {
      const res = await api.get("/users");
      setAllUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpdateRole = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      await fetchAll();
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Gagal merubah role pengguna.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUserToDelete(null);
      await fetchAll();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Gagal menghapus pengguna.");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "admin": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "subscriber": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "user": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === "superadmin";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Daftar Pengguna</h1>
        <p className="text-muted-foreground mt-1 font-bold text-sm">Lihat semua akun pengguna yang terdaftar di platform.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-8 py-5 text-xs font-black tracking-widest text-muted-foreground uppercase">User</th>
              <th className="text-left px-8 py-5 text-xs font-black tracking-widest text-muted-foreground uppercase">Role</th>
              <th className="text-left px-8 py-5 text-xs font-black tracking-widest text-muted-foreground uppercase">Bergabung</th>
              {isSuperAdmin && (
                <th className="text-right px-8 py-5 text-xs font-black tracking-widest text-muted-foreground uppercase">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allUsers.map((user) => (
              <tr key={user.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand font-black text-sm flex-shrink-0 shadow-sm uppercase">
                      {user.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  {isSuperAdmin && user.id !== currentUser?.id ? (
                    <select
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border bg-card text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand transition-all",
                        getRoleBadgeColor(user.role)
                      )}
                    >
                      <option value="user" className="bg-card text-foreground">User</option>
                      <option value="subscriber" className="bg-card text-foreground">Subscriber</option>
                      <option value="admin" className="bg-card text-foreground">Admin</option>
                      <option value="superadmin" className="bg-card text-foreground">Superadmin</option>
                    </select>
                  ) : (
                    <span className={cn("px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border", getRoleBadgeColor(user.role))}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-8 py-5 text-sm font-bold text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                {isSuperAdmin && (
                  <td className="px-8 py-5 text-right">
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingId === user.id}
                        onClick={() => setUserToDelete(user)}
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500 rounded-xl px-4 py-2 h-auto font-bold tracking-wider text-xs uppercase"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5 mr-1.5" />
                        Hapus
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Popup Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
              <Icon name="trash" className="w-8 h-8" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-foreground">Hapus Pengguna Ini?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Anda yakin ingin menghapus akun <span className="font-bold text-foreground">{userToDelete.name}</span> ({userToDelete.email})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-border text-foreground font-bold hover:bg-secondary"
                onClick={() => setUserToDelete(null)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
                onClick={confirmDelete}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
