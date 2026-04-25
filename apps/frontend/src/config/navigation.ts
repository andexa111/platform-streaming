export const NAV_LINKS = {
  public: [
    { name: "Home", href: "/" },
    { name: "Movies & Shows", href: "/movies" },
    { name: "Genres", href: "/genres" },
  ],
  member: [
    { name: "Home", href: "/home" },
    { name: "Movies & Shows", href: "/movies" },
    { name: "Genres", href: "/genres" },
  ],
  admin: [
    { name: "Home", href: "/admin", icon: "dashboard" },
    { name: "Analytics", href: "/admin/analytics", icon: "analytics" },
    { name: "Movies", href: "/admin/movies", icon: "film" },
    { name: "Genres", href: "/admin/genres", icon: "tag" },
    { name: "Banners", href: "/admin/banners", icon: "image" },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: "subscription" },
    { name: "Ads", href: "/admin/ads", icon: "ads" },
    { name: "Users", href: "/admin/users", icon: "users" },
  ],
};
