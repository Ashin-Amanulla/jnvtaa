import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/utils/cn";

const discoverItems = [
  { name: "Events", path: "/events" },
  { name: "News", path: "/news" },
  { name: "Jobs", path: "/jobs" },
  { name: "Gallery", path: "/gallery" },
];

const linkClass =
  "rounded-wobblySm px-3 py-2 font-sans text-lg text-foreground underline decoration-dashed decoration-2 underline-offset-[6px] hover:text-accent hover:decoration-accent focus-ring";

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
      className="sticky top-0 z-50 border-b-[3px] border-dashed border-border bg-background/95 shadow-sketchSm backdrop-blur-sm"
      aria-label="Main"
    >
      <div className="container-custom">
        <div className="flex h-[4.5rem] items-center justify-between md:h-20">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 focus-ring rounded-wobblySm md:gap-3"
            aria-label="JNVTAA home"
          >
            <img
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="h-11 w-11 shrink-0 rotate-[-2deg] border-[3px] border-border bg-white object-cover shadow-sketch transition-transform duration-100 group-hover:rotate-0 md:h-12 md:w-12"
              style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
            />
            <span className="hidden items-center gap-1 md:inline-flex" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-house-green" />
              <span className="h-2.5 w-2.5 rounded-full bg-house-red" />
              <span className="h-2.5 w-2.5 rounded-full bg-house-blue" />
              <span className="h-2.5 w-2.5 rounded-full bg-house-yellow" />
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.slice(0, 2).map((link) => (
              <Link key={link.path} to={link.path} className={linkClass}>
                {link.name}
              </Link>
            ))}
            <div className="relative" ref={discoverRef}>
              <button
                type="button"
                id="nav-discover-trigger"
                className={cn(
                  linkClass,
                  "inline-flex items-center gap-0.5 !no-underline hover:underline",
                  isDiscoverActive && "text-accent decoration-accent",
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
                  strokeWidth={2.5}
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
                  <div className="rounded-wobblySm border-[3px] border-border bg-white py-2 shadow-sketch">
                    {discoverItems.map((item) => (
                      <Link
                        key={item.path}
                        role="menuitem"
                        to={item.path}
                        className="block px-4 py-2.5 font-sans text-lg text-foreground hover:bg-muted focus-ring"
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
              <Link key={link.path} to={link.path} className={linkClass}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                {(user?.role === "admin" || user?.role === "moderator") && (
                  <Link
                    to="/admin"
                    className="font-sans text-lg text-pen underline decoration-wavy decoration-2 underline-offset-4 focus-ring rounded-wobblySm px-2"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-wobblySm border-2 border-border bg-white px-3 py-2 font-sans text-lg shadow-sketchSm focus-ring hover:-rotate-1"
                >
                  <User size={20} strokeWidth={2.5} aria-hidden />
                  <span>{user?.firstName}</span>
                </Link>
                <Link
                  to="/directory"
                  className="font-sans text-lg text-house-blue underline decoration-wavy decoration-2 underline-offset-4 focus-ring rounded-wobblySm px-2"
                >
                  Directory
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-wobblySm border-2 border-dashed border-border px-3 py-2 font-sans text-lg focus-ring hover:border-solid hover:shadow-sketchSm"
                >
                  <LogOut size={20} strokeWidth={2.5} aria-hidden />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-ghost px-4 py-2 text-base md:text-lg">
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-wobblySm border-[3px] border-border bg-white shadow-sketch lg:hidden focus-ring"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? (
              <X size={24} strokeWidth={2.5} aria-hidden />
            ) : (
              <Menu size={24} strokeWidth={2.5} aria-hidden />
            )}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          id="mobile-nav"
          className="border-t-[3px] border-dashed border-border bg-background lg:hidden"
        >
          <div className="container-custom space-y-2 py-6">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block rounded-wobblySm border-2 border-border bg-white px-4 py-3 font-sans text-xl shadow-sketchSm focus-ring"
              >
                {link.name}
              </Link>
            ))}
            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-wobblySm border-2 border-border bg-white px-4 py-3 font-sans text-xl shadow-sketchSm focus-ring"
                aria-expanded={mobileDiscoverOpen}
                onClick={() => setMobileDiscoverOpen((o) => !o)}
              >
                Discover
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200",
                    mobileDiscoverOpen && "rotate-180",
                  )}
                  strokeWidth={2.5}
                  aria-hidden
                />
              </button>
              {mobileDiscoverOpen && (
                <div className="ml-3 space-y-2 border-l-[3px] border-dashed border-border pl-3">
                  {discoverItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setIsOpen(false);
                        setMobileDiscoverOpen(false);
                      }}
                      className="block rounded-wobblySm border-2 border-border bg-white px-4 py-3 font-sans text-lg shadow-sketchSm focus-ring"
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
                className="block rounded-wobblySm border-2 border-border bg-white px-4 py-3 font-sans text-xl shadow-sketchSm focus-ring"
              >
                {link.name}
              </Link>
            ))}
            <div className="section-divider my-4" />
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary w-full justify-center"
                >
                  Dashboard
                </Link>
                <Link
                  to="/directory"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline w-full justify-center"
                >
                  Directory
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="btn-outline w-full justify-center"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-primary mt-2 w-full justify-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
