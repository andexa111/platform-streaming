"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useReportStore } from "@/lib/report-store";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

export default function AdminReportsPage() {
  const { reports, markAsResolved, deleteReport, clearUnreadCount } = useReportStore();
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Resolved">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [prevReportCount, setPrevReportCount] = useState(reports.length);
  const [showToast, setShowToast] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedReports((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Clear unread count when visiting the reports page
  useEffect(() => {
    clearUnreadCount();
  }, [clearUnreadCount]);

  // Real-time detection of new incoming reports while admin is on this page
  useEffect(() => {
    if (reports.length > prevReportCount) {
      setShowToast(true);
      clearUnreadCount();
      const timer = setTimeout(() => setShowToast(false), 6000);
      return () => clearTimeout(timer);
    }
    setPrevReportCount(reports.length);
  }, [reports.length, prevReportCount, clearUnreadCount]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, startDate, endDate]);

  const filteredReports = reports.filter((r) => {
    const matchesFilter = filter === "ALL" || r.status === filter;
    const matchesSearch =
      r.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.message.toLowerCase().includes(searchQuery.toLowerCase());

    const reportDate = new Date(r.date);

    let matchesDate = true;
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate + "T00:00:00") : new Date(0);
      const end = endDate ? new Date(endDate + "T23:59:59") : new Date();
      matchesDate = reportDate >= start && reportDate <= end;
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  return (
    <div className="space-y-8 pb-20">
      {/* Detail Modal Pop-up */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />

          {/* Modal Box */}
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                  <Icon name="flag" className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-foreground">Detail Laporan Bug</h3>
                    <span
                      className={cn(
                        "px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        selectedReport.status === "Pending"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      )}
                    >
                      {selectedReport.status === "Pending" ? "Pending" : "Selesai"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium pt-0.5">
                    Dikirim pada: {new Date(selectedReport.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="space-y-5">
              {/* User / Reporter Info Card */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Informasi Pelapor</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                      <Icon name="user" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Nama User</p>
                      <p className="text-xs font-black text-foreground">{selectedReport.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm">
                      <Icon name="mail" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Email User</p>
                      <p className="text-xs font-black text-foreground break-all">{selectedReport.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Film Target Info */}
              <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand/20">
                    <Icon name="film" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-brand font-black uppercase tracking-widest">Judul Film Yang Dilaporkan</p>
                    <p className="text-sm font-black text-foreground">{selectedReport.movieTitle}</p>
                  </div>
                </div>

                {selectedReport.movieId && (
                  <Link
                    href={`/movies/${selectedReport.movieId}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto cursor-pointer"
                  >
                    <span>Buka Halaman Film</span>
                    <Icon name="external-link" className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Message / Complaint Details */}
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Isi Keluhan / Detail Kendala</p>
                <div className="p-4 rounded-xl bg-background border border-border text-xs text-foreground leading-relaxed whitespace-pre-line font-medium max-h-60 overflow-y-auto">
                  {selectedReport.message}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-2">
              {selectedReport.status === "Pending" && (
                <button
                  onClick={() => {
                    markAsResolved(selectedReport.id);
                    setSelectedReport({ ...selectedReport, status: "Resolved" });
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>Tandai Selesai</span>
                </button>
              )}

              <button
                onClick={() => {
                  deleteReport(selectedReport.id);
                  setSelectedReport(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Icon name="trash-2" className="w-4 h-4" />
                <span>Hapus</span>
              </button>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Toast Alert when new report arrives */}
      {showToast && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 animate-in slide-in-from-top-4 duration-300 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="bell" className="w-5 h-5 text-emerald-500 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">🔔 Laporan Bug Baru Saja Masuk!</p>
              <p className="text-[11px] text-muted-foreground">Daftar laporan telah diperbarui secara otomatis.</p>
            </div>
          </div>
          <button onClick={() => setShowToast(false)} className="p-1.5 hover:bg-emerald-500/20 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Laporan Bug</h1>
        <p className="text-muted-foreground text-sm font-medium">Daftar laporan masalah yang dikirim oleh pengguna.</p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-2 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Laporan</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-foreground">{totalReports}</span>
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Icon name="flag" className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 shadow-sm">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Menunggu Penanganan</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Icon name="warning" className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Selesai Ditangani</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Icon name="check" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card p-4 md:p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        {/* Row 1: Status Filter & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["ALL", "Pending", "Resolved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  filter === tab ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {tab === "ALL" ? "Semua Status" : tab === "Pending" ? "Pending" : "Selesai"}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Icon name="search" className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul film, nama, pesan..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-border/60" />

        {/* Row 2: Date Picker Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Icon name="calendar" className="w-4 h-4" />
            </div>
            <span>Pilih Tanggal Laporan:</span>
          </div>

          {/* Custom Date Range Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground font-medium focus:outline-none focus:border-brand cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground font-medium focus:outline-none focus:border-brand cursor-pointer"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-colors cursor-pointer"
                title="Reset Tanggal"
              >
                <Icon name="x" className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports List / Table */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Icon name="search-x" className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Tidak Ada Laporan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {reports.length === 0 ? "Belum ada pengguna yang mengirimkan laporan kendala atau bug." : "Tidak ada laporan yang sesuai dengan kriteria filter atau pencarian Anda."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={cn(
                  "p-6 rounded-2xl bg-card border transition-all duration-300 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm hover:shadow-lg cursor-pointer group hover:border-brand/50",
                  report.status === "Pending" ? "border-amber-500/30" : "border-border",
                )}
              >
                <div className="space-y-3 flex-1">
                  {/* Header info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        report.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                      )}
                    >
                      {report.status === "Pending" ? "Pending" : "Selesai"}
                    </span>
                    <span className="text-xs text-brand font-bold">Film: {report.movieTitle}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(report.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Pelapor Info */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Icon name="user" className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{report.name}</span>
                    <span className="text-muted-foreground">({report.email})</span>
                  </div>

                  {/* Message Box */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground font-normal leading-relaxed">
                    <p className="font-bold text-[10px] uppercase text-muted-foreground mb-1">Detail Kendala:</p>
                    <p className="line-clamp-2 transition-all duration-300 whitespace-pre-line">
                      {report.message}
                    </p>
                    <span className="mt-2 text-brand font-bold text-xs group-hover:underline flex items-center gap-1">
                      <span>Lihat Detail Laporan</span>
                      <Icon name="chevron-right" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold transition-all shadow-sm hover:bg-brand-dark cursor-pointer"
                  >
                    <Icon name="eye" className="w-3.5 h-3.5" />
                    Lihat Detail
                  </button>

                  {report.status === "Pending" && (
                    <button
                      onClick={() => markAsResolved(report.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Icon name="check" className="w-3.5 h-3.5" />
                      Tandai Selesai
                    </button>
                  )}
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 transition-all cursor-pointer"
                  >
                    <Icon name="trash-2" className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/80">
              <p className="text-xs text-muted-foreground font-medium">
                Menampilkan <span className="font-bold text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{" "}
                <span className="font-bold text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)}</span> dari{" "}
                <span className="font-bold text-foreground">{filteredReports.length}</span> laporan
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="chevron-left" className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer",
                      currentPage === page
                        ? "bg-brand text-white border-brand shadow-sm shadow-brand/20"
                        : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
