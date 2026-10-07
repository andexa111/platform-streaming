export const NAV_LINKS = {
  public: [
    { name: "Home", href: "/", icon: "" },
    { name: "Movies & Shows", href: "/movies", icon: "" },
    { name: "Kategori", href: "/categories", icon: "" },
  ],
  member: [
    { name: "Home", href: "/home", icon: "" },
    { name: "Movies & Shows", href: "/movies", icon: "" },
    { name: "Kategori", href: "/categories", icon: "" },
  ],

  // Menu untuk admin biasa
  adminBasic: [
    { name: "Home", href: "/admin", icon: "dashboard" },
    { name: "Movies", href: "/admin/movies", icon: "film" },
    { name: "Home Sections", href: "/admin/sections", icon: "sliders-horizontal" },
    { name: "Informasi", href: "/admin/info", icon: "info" },
    { name: "Banners", href: "/admin/banners", icon: "image" },
    { name: "Ads", href: "/admin/ads", icon: "ads" },
    { name: "Banner Ads", href: "/admin/banner-ads", icon: "ads" },
    { name: "Laporan Bug", href: "/admin/reports", icon: "flag" },
    { name: "Users", href: "/admin/users", icon: "users" },
  ],

  // Menu tambahan untuk superadmin (semua + management)
  adminSuper: [
    { name: "Home", href: "/superadmin", icon: "dashboard" },
    { name: "Movies", href: "/superadmin/movies", icon: "film" },
    { name: "Home Sections", href: "/admin/sections", icon: "sliders-horizontal" },

    { name: "Informasi", href: "/superadmin/info", icon: "info" },
    { name: "Banners", href: "/superadmin/banners", icon: "image" },
    { name: "Ads", href: "/superadmin/ads", icon: "ads" },
    { name: "Banner Ads", href: "/superadmin/banner-ads", icon: "ads" },
    { name: "Subscriptions", href: "/superadmin/subscriptions", icon: "coins" },
    { name: "Discounts", href: "/superadmin/discounts", icon: "tag" },
    { name: "Laporan Bug", href: "/admin/reports", icon: "flag" },
    { name: "Users", href: "/superadmin/users", icon: "users" },
  ],

  // Legacy alias — backward compatibility
  admin: [
    { name: "Home", href: "/admin", icon: "dashboard" },
    { name: "Movies", href: "/admin/movies", icon: "film" },
    { name: "Home Sections", href: "/admin/sections", icon: "sliders-horizontal" },

    { name: "Informasi", href: "/admin/info", icon: "info" },
    { name: "Banners", href: "/admin/banners", icon: "image" },
    { name: "Koin & Transaksi", href: "/admin/subscriptions", icon: "coins" },
    { name: "Ads", href: "/admin/ads", icon: "ads" },
    { name: "Laporan Bug", href: "/admin/reports", icon: "flag" },
    { name: "Users", href: "/admin/users", icon: "users" },
  ],
};
