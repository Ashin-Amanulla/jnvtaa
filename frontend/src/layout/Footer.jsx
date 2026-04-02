import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { siteContact, getSocialNavLinks } from "@/config/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const socialLinks = getSocialNavLinks();

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Directory", path: "/directory" },
    { name: "Events", path: "/events" },
    { name: "News", path: "/news" },
  ];

  const resources = [
    { name: "Gallery", path: "/gallery" },
    { name: "Jobs", path: "/jobs" },
    { name: "Donate", path: "/donate" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="relative mt-auto border-t-[3px] border-border bg-postit">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] paper-overlay"
        aria-hidden
      />
      <div className="container-custom relative py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rotate-2 border-[3px] border-border bg-white object-cover shadow-sketch"
                style={{
                  borderRadius: "15px 255px 15px 225px / 225px 15px 255px 15px",
                }}
              />
              <div>
                <div className="font-display text-xl font-bold text-foreground">
                  JNVTAA
                </div>
                <div className="font-sans text-sm text-muted-foreground">
                  Alumni association · hand-drawn heart
                </div>
              </div>
            </div>
            <p className="max-w-sm font-sans text-lg text-foreground/90">
              Connecting JNV Trivandrum alumni worldwide—messy notes, real
              friendships, and giving back like we&apos;re still on campus.
            </p>
            <div className="mt-8 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-wobbly border-2 border-border bg-white text-foreground shadow-sketchSm transition-transform duration-100 hover:-rotate-6 focus-ring"
                >
                  <Icon size={20} strokeWidth={2.5} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 font-display text-2xl font-bold text-foreground underline decoration-wavy decoration-2 underline-offset-[6px]">
              Quick links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-sans text-lg text-foreground underline decoration-dashed decoration-2 underline-offset-4 hover:text-accent hover:line-through focus-ring rounded-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-display text-2xl font-bold text-foreground underline decoration-wavy decoration-2 underline-offset-[6px]">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-sans text-lg text-foreground underline decoration-dashed decoration-2 underline-offset-4 hover:text-accent hover:line-through focus-ring rounded-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-display text-2xl font-bold text-foreground underline decoration-wavy decoration-2 underline-offset-[6px]">
              Say hi
            </h3>
            <ul className="space-y-5">
              <li className="flex gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-wobblySm border-2 border-border bg-white shadow-sketchSm">
                  <MapPin size={18} strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-sans text-lg leading-snug">
                  {siteContact.addressLine1}
                  <br />
                  {siteContact.addressLine2}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-wobblySm border-2 border-border bg-white shadow-sketchSm">
                  <Mail size={18} strokeWidth={2.5} aria-hidden />
                </span>
                <a
                  href={`mailto:${siteContact.emailPrimary}`}
                  className="font-sans text-lg underline decoration-wavy decoration-2 underline-offset-4 hover:text-pen focus-ring"
                >
                  {siteContact.emailPrimary}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-wobblySm border-2 border-border bg-white shadow-sketchSm">
                  <Phone size={18} strokeWidth={2.5} aria-hidden />
                </span>
                <span className="font-sans text-lg leading-snug">
                  <a
                    href={`tel:${siteContact.phoneTelPrimary}`}
                    className="underline decoration-wavy decoration-2 underline-offset-4 hover:text-pen focus-ring"
                  >
                    {siteContact.phoneDisplayPrimary}
                  </a>
                  {siteContact.phoneDisplaySecondary && (
                    <>
                      <br />
                      <a
                        href={`tel:${siteContact.phoneTelSecondary}`}
                        className="underline decoration-wavy decoration-2 underline-offset-4 hover:text-pen focus-ring"
                      >
                        {siteContact.phoneDisplaySecondary}
                      </a>
                    </>
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-divider mt-14" />
        <div className="mt-8 space-y-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="font-sans text-base text-muted-foreground">
              © {currentYear} JNVTAA — scribbled with love.
            </p>
            <p className="font-sans text-base text-muted-foreground">
              Imperfect on purpose · alumni-first
            </p>
          </div>
          <p className="text-center font-sans text-xs text-muted-foreground md:text-left">
            Developed by alumni Ashin Amanulla —{" "}
            <a
              href="https://xyvin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dashed decoration-1 underline-offset-2 hover:text-pen focus-ring rounded-sm"
            >
              xyvin.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
