import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Newspaper,
  Image,
  Heart,
  Briefcase,
  Handshake,
  Mail,
  Inbox,
  FileText,
  ScrollText,
  Settings,
  PictureInPicture2,
  BookUser,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { authAPI } from "@/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  isSuperAdmin,
  ROLES,
  PERMISSIONS,
  hasPermission,
} from "@/utils/roles";

const MAIN_NAV_ITEMS = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/staff-access",
    label: "Staff Access",
    icon: Shield,
    superAdminOnly: true,
  },
];

const NAV_GROUPS = [
  {
    id: "people",
    label: "People",
    items: [
      {
        to: "/admin/users",
        label: "Users",
        icon: Users,
        permission: PERMISSIONS.USERS_READ,
      },
      {
        to: "/admin/directory",
        label: "Directory",
        icon: BookUser,
        permission: PERMISSIONS.USERS_READ,
      },
      {
        to: "/admin/batches",
        label: "Batches",
        icon: GraduationCap,
        permission: PERMISSIONS.BATCHES_MANAGE,
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        to: "/admin/site-content",
        label: "Site Content",
        icon: FileText,
        permission: PERMISSIONS.SITE_CONTENT_MANAGE,
      },
      {
        to: "/admin/popup",
        label: "Site Popup",
        icon: PictureInPicture2,
        permission: PERMISSIONS.SITE_CONTENT_MANAGE,
      },
      {
        to: "/admin/news",
        label: "News",
        icon: Newspaper,
        permission: PERMISSIONS.NEWS_MANAGE,
      },
      {
        to: "/admin/gallery",
        label: "Gallery",
        icon: Image,
        permission: PERMISSIONS.GALLERY_MANAGE,
      },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    items: [
      {
        to: "/admin/events",
        label: "Events",
        icon: Calendar,
        permission: PERMISSIONS.EVENTS_MANAGE,
      },
      {
        to: "/admin/mentorship",
        label: "Mentorship",
        icon: Handshake,
        permission: PERMISSIONS.MENTORSHIP_MANAGE,
      },
      {
        to: "/admin/jobs",
        label: "Jobs",
        icon: Briefcase,
        permission: PERMISSIONS.JOBS_MANAGE,
      },
    ],
  },
  {
    id: "communications",
    label: "Communications",
    items: [
      {
        to: "/admin/newsletter",
        label: "Newsletter",
        icon: Mail,
        permission: PERMISSIONS.NEWSLETTER_MANAGE,
      },
      {
        to: "/admin/contact",
        label: "Contact Inbox",
        icon: Inbox,
        permission: PERMISSIONS.CONTACT_MANAGE,
      },
    ],
  },
  {
    id: "fundraising",
    label: "Fundraising",
    items: [
      {
        to: "/admin/donations",
        label: "Donations",
        icon: Heart,
        permission: PERMISSIONS.DONATIONS_MANAGE,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        to: "/admin/audit-log",
        label: "Audit Log",
        icon: ScrollText,
        permission: PERMISSIONS.AUDIT_LOG_READ,
      },
      {
        to: "/admin/settings",
        label: "Settings",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
    ],
  },
];

const STORAGE_KEY = "admin-nav-groups";

function getVisibleMainNavItems(user) {
  return MAIN_NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin(user)
  );
}

function getVisibleGroups(user) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || hasPermission(user, item.permission)
    ),
  })).filter((group) => group.items.length > 0);
}

function getInitialOpenGroups(location, user) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }

  const open = {};
  getVisibleGroups(user).forEach((group) => {
    open[group.id] = group.items.some((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
    );
  });
  return open;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState(() =>
    getInitialOpenGroups(location, user)
  );

  const visibleGroups = getVisibleGroups(user);
  const visibleMainNavItems = getVisibleMainNavItems(user);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      visibleGroups.forEach((group) => {
        const isActive = group.items.some((item) =>
          item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
        );
        if (isActive) next[group.id] = true;
      });
      return next;
    });
  }, [location.pathname, user]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    logout();
    navigate("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "A";

  return (
    <div className="admin-theme font-admin min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link
            to="/admin"
            className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setSidebarOpen(false)}
          >
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className="truncate text-sm font-semibold leading-tight">
              {isSuperAdmin(user) ? "JNVTAA Platform" : "JNVTAA Admin"}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-2">
            {visibleMainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}

            {visibleMainNavItems.length > 0 && visibleGroups.length > 0 && (
              <li aria-hidden className="my-2 border-t" />
            )}

            {visibleGroups.map((group) => {
              const isOpen = openGroups[group.id] ?? false;

              return (
                <li key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span>{group.label}</span>
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {isOpen && (
                    <ul className="mt-1 space-y-1 pl-2">
                      {group.items.map(({ to, label, icon: Icon, end, permission }) => {
                        if (permission && !hasPermission(user, permission)) {
                          return null;
                        }

                        return (
                          <li key={to}>
                            <NavLink
                              to={to}
                              end={end}
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )
                              }
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              {label}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center gap-2">
            {user?.role === ROLES.ADMIN && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Switch to Member view</Link>
              </Button>
            )}
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-label="Close menu"
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-popover py-1 shadow-md">
                    <div className="border-b px-3 py-2">
                      <p className="text-sm font-medium">{user?.email}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {user?.role?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
