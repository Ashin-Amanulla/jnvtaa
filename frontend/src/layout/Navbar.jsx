import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/utils/cn";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Directory", path: "/directory" },
    { name: "Events", path: "/events" },
    { name: "News", path: "/news" },
    { name: "Gallery", path: "/gallery" },
    { name: "Donate", path: "/donate" },
    { name: "Jobs", path: "/jobs" },
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
            className="group inline-flex focus-ring rounded-wobblySm"
            aria-label="JNVTAA home"
          >
            <span
              className="inline-flex min-h-12 min-w-12 rotate-[-2deg] items-center justify-center border-[3px] border-border bg-white px-4 py-2 font-display text-2xl font-bold text-foreground shadow-sketch transition-transform duration-100 group-hover:rotate-0 group-hover:bg-accent group-hover:text-white md:px-5"
              style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
            >
              JNV
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "rounded-wobblySm px-3 py-2 font-sans text-lg text-foreground underline decoration-dashed decoration-2 underline-offset-[6px]",
                  "hover:text-accent hover:decoration-accent focus-ring",
                )}
              >
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
            {navLinks.map((link) => (
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
