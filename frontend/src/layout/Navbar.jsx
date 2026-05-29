import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/utils/cn";
import { canAccessAdmin, isSuperAdmin, isAlumniMember } from "@/utils/roles";
import NotificationBell from "@/components/NotificationBell";

const discoverItems = [
  { name: "Events", path: "/events" },
  { name: "News", path: "/news" },
  { name: "Jobs", path: "/jobs" },
  { name: "Gallery", path: "/gallery" },
  { name: "Batches", path: "/batches" },
  { name: "Mentorship", path: "/mentorship" },
  { name: "Map", path: "/map" },
  { name: "Achievements", path: "/achievements" },
];

const linkBase =
  "rounded-lg px-3 py-2 font-sans text-base font-medium transition-colors focus-ring";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const discoverRef = useRef(null);
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isDiscoverActive = discoverItems.some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const navLinkClass = (path) =>
    cn(
      linkBase,
      isActive(path)
        ? "bg-brand-soft text-brand"
        : "text-foreground hover:bg-muted hover:text-brand",
    );

  const directoryPath = canAccessAdmin(user) ? "/admin/directory" : "/directory";

  useEffect(() => {
    if (!discoverOpen) return;
    const onDoc = (e) => {
      if (discoverRef.current && !discoverRef.current.contains(e.target)) {
        setDiscoverOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setDiscoverOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [discoverOpen]);

  useEffect(() => {
    setDiscoverOpen(false);
    setIsOpen(false);
    setMobileDiscoverOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Donate", path: "/donate" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
      aria-label="Main"
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between md:h-[4.5rem]">
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 focus-ring rounded-lg"
            aria-label="JNVTAA home"
          >
            <img
              src="/logo.png"
              alt=""
              width={44}
              height={44}
              className="h-10 w-10 shrink-0 rounded-xl border border-border bg-white object-cover md:h-11 md:w-11"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold text-foreground">
                JNVTAA
              </span>
              <span className="mt-1 hidden items-center gap-1 md:inline-flex" aria-hidden>
                <span className="h-1.5 w-4 rounded-full bg-house-green" />
                <span className="h-1.5 w-4 rounded-full bg-house-red" />
                <span className="h-1.5 w-4 rounded-full bg-house-blue" />
                <span className="h-1.5 w-4 rounded-full bg-house-yellow" />
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.slice(0, 2).map((link) => (
              <Link key={link.path} to={link.path} className={navLinkClass(link.path)}>
                {link.name}
              </Link>
            ))}
            <div className="relative" ref={discoverRef}>
              <button
                type="button"
                id="nav-discover-trigger"
                className={cn(
                  linkBase,
                  "inline-flex items-center gap-0.5",
                  isDiscoverActive
                    ? "bg-brand-soft text-brand"
                    : "text-foreground hover:bg-muted hover:text-brand",
                )}
                aria-expanded={discoverOpen}
                aria-haspopup="menu"
                aria-controls="nav-discover-menu"
                onClick={() => setDiscoverOpen((open) => !open)}
              >
                Discover
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    discoverOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {discoverOpen && (
                <div
                  id="nav-discover-menu"
                  role="menu"
                  aria-labelledby="nav-discover-trigger"
                  className="absolute left-0 top-full z-50 min-w-[12rem] pt-2"
                >
                  <div className="overflow-hidden rounded-xl border border-border bg-surface py-1.5 shadow-cardHover">
                    {discoverItems.map((item) => (
                      <Link
                        key={item.path}
                        role="menuitem"
                        to={item.path}
                        className="block px-4 py-2 font-sans text-base text-foreground transition-colors hover:bg-muted hover:text-brand focus-ring"
                        onClick={() => setDiscoverOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {navLinks.slice(2).map((link) => (
              <Link key={link.path} to={link.path} className={navLinkClass(link.path)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              isSuperAdmin(user) ? (
                <>
                  <Link to="/admin" className={navLinkClass("/admin")}>
                    Platform Admin
                  </Link>
                  <Link to="/admin/directory" className={navLinkClass("/admin/directory")}>
                    Directory
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                  >
                    <LogOut size={18} aria-hidden />
                    Logout
                  </button>
                </>
              ) : (
              <>
                <NotificationBell />
                <Link
                  to="/messages"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-muted hover:text-brand focus-ring"
                  aria-label="Messages"
                >
                  <MessageCircle size={19} />
                </Link>
                {canAccessAdmin(user) && (
                  <Link to="/admin" className={navLinkClass("/admin")}>
                    Admin
                  </Link>
                )}
                <Link to={directoryPath} className={navLinkClass(directoryPath)}>
                  Directory
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-sans text-base font-medium transition-colors hover:bg-muted hover:text-brand focus-ring"
                >
                  <User size={18} aria-hidden />
                  <span>{user?.firstName}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring"
                >
                  <LogOut size={18} aria-hidden />
                  Logout
                </button>
              </>
              )
            ) : (
              <>
                <Link to="/login" className={navLinkClass("/login")}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-5 py-2 text-sm">
                  Join JNVTAA
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-foreground lg:hidden focus-ring"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          id="mobile-nav"
          className="border-t border-border bg-surface lg:hidden"
        >
          <div className="container-custom space-y-1.5 py-5">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-2.5 font-sans text-base font-medium text-foreground transition-colors hover:bg-muted focus-ring"
              >
                {link.name}
              </Link>
            ))}
            <div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 font-sans text-base font-medium text-foreground transition-colors hover:bg-muted focus-ring"
                aria-expanded={mobileDiscoverOpen}
                onClick={() => setMobileDiscoverOpen((o) => !o)}
              >
                Discover
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200",
                    mobileDiscoverOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {mobileDiscoverOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                  {discoverItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setIsOpen(false);
                        setMobileDiscoverOpen(false);
                      }}
                      className="block rounded-lg px-4 py-2 font-sans text-base text-foreground transition-colors hover:bg-muted focus-ring"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-4 py-2.5 font-sans text-base font-medium text-foreground transition-colors hover:bg-muted focus-ring"
              >
                {link.name}
              </Link>
            ))}
            <div className="section-divider my-3" />
            {isAuthenticated ? (
              isSuperAdmin(user) ? (
                <div className="flex flex-col gap-2.5">
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full"
                  >
                    Platform Admin
                  </Link>
                  <Link
                    to="/admin/directory"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary w-full"
                  >
                    Directory
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="btn-ghost w-full justify-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full"
                >
                  Dashboard
                </Link>
                {isAlumniMember(user) && (
                  <>
                    <Link
                      to={directoryPath}
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary w-full"
                    >
                      Directory
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary w-full"
                    >
                      Messages
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setIsOpen(false)}
                      className="btn-secondary w-full"
                    >
                      Notifications
                    </Link>
                  </>
                )}
                {canAccessAdmin(user) && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary w-full"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="btn-ghost w-full justify-center"
                >
                  Logout
                </button>
              </div>
              )
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary w-full"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full"
                >
                  Join JNVTAA
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
