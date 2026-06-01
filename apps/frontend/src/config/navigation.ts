export const NAV_LINKS = {
  public: [
    { name: "Home", href: "/", icon: "" },
    { name: "Movies & Shows", href: "/movies", icon: "" },
    { name: "Genres", href: "/genres", icon: "" },
    // { name: "Membership", href: "/membership", icon: "" },
  ],
  member: [
    { name: "Home", href: "/home", icon: "" },
    { name: "Movies & Shows", href: "/movies", icon: "" },
    { name: "Genres", href: "/genres", icon: "" },
    // { name: "Membership", href: "/membership", icon: "" },
  ],

  // Menu untuk admin biasa
  adminBasic: [
    { name: "Home", href: "/admin", icon: "dashboard" },
    // { name: "Analytics", href: "/admin/analytics", icon: "analytics" },
    { name: "Movies", href: "/admin/movies", icon: "film" },
    { name: "Home Sections", href: "/admin/sections", icon: "sliders-horizontal" },
    // { name: "Genres", href: "/admin/genres", icon: "tag" },
    { name: "Informasi", href: "/admin/info", icon: "info" },
    { name: "Banners", href: "/admin/banners", icon: "image" },
    { name: "Ads", href: "/admin/ads", icon: "ads" },
    { name: "Users", href: "/admin/users", icon: "users" },
  ],

  // Menu tambahan untuk superadmin (semua + management)
  adminSuper: [
    { name: "Home", href: "/superadmin", icon: "dashboard" },
    // { name: "Analytics", href: "/superadmin/analytics", icon: "analytics" },
    { name: "Movies", href: "/superadmin/movies", icon: "film" },
    { name: "Home Sections", href: "/admin/sections", icon: "sliders-horizontal" },
    // { name: "Genres", href: "/superadmin/genres", icon: "tag" },
    { name: "Informasi", href: "/superadmin/info", icon: "info" },
    { name: "Banners", href: "/superadmin/banners", icon: "image" },
    { name: "Ads", href: "/superadmin/ads", icon: "ads" },
    { name: "Subscriptions", href: "/superadmin/subscriptions", icon: "subscription" },
    { name: "Discounts", href: "/superadmin/discounts", icon: "tag" },
    { name: "Users", href: "/superadmin/users", icon: "users" },
  ],

  // Legacy alias — backward compatibility
  admin: [
    { name: "Home", href: "/admin", icon: "dashboard" },
    // { name: "Analytics", href: "/admin/analytics", icon: "analytics" },
    { name: "Movies", href: "/admin/movies", icon: "film" },
    { name: "Home Sections", href: "/admin/sections", icon: "sliders-horizontal" },
    // { name: "Genres", href: "/admin/genres", icon: "tag" },
    { name: "Informasi", href: "/admin/info", icon: "info" },
    { name: "Banners", href: "/admin/banners", icon: "image" },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: "subscription" },
    { name: "Ads", href: "/admin/ads", icon: "ads" },
    { name: "Users", href: "/admin/users", icon: "users" },
  ],
};
