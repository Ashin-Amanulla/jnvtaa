import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { siteContact, getSocialNavLinks } from "@/config/site";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const socialLinks = getSocialNavLinks();

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Batches", path: "/batches" },
    { name: "Events", path: "/events" },
    { name: "News", path: "/news" },
  ];

  const resources = [
    { name: "Gallery", path: "/gallery" },
    { name: "Jobs", path: "/jobs" },
    { name: "Mentorship", path: "/mentorship" },
    { name: "Achievements", path: "/achievements" },
    { name: "Donate", path: "/donate" },
    { name: "Contact", path: "/contact" },
  ];

  const footerLinkClass =
    "font-sans text-base text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white";

  return (
    <footer className="relative mt-auto bg-brand text-white">
      <span
        className="block h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--house-green) 0% 25%, var(--house-red) 25% 50%, var(--house-blue) 50% 75%, var(--house-yellow) 75% 100%)",
        }}
        aria-hidden
      />
      <div className="container-custom relative py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/logo.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-xl border border-white/20 bg-white object-cover"
              />
              <div>
                <div className="font-display text-lg font-bold text-white">
                  JNVTAA
                </div>
                <div className="font-sans text-sm text-white/60">
                  JNV Thiruvananthapuram Alumni Association
                </div>
              </div>
            </div>
            <p className="max-w-sm font-sans text-base text-white/70">
              We connect Navodayans across generations — honouring the NVS
              mandate, celebrating JNVST talent, and giving back to the school
              that shaped us.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <Icon size={18} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 font-display text-base font-semibold uppercase tracking-wide text-white/90">
              Quick links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={footerLinkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-display text-base font-semibold uppercase tracking-wide text-white/90">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={footerLinkClass}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 font-display text-base font-semibold uppercase tracking-wide text-white/90">
              Contact us
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <MapPin size={17} aria-hidden />
                </span>
                <span className="font-sans text-base leading-snug text-white/70">
                  {siteContact.addressLine1}
                  <br />
                  {siteContact.addressLine2}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <Mail size={17} aria-hidden />
                </span>
                <a href={`mailto:${siteContact.emailPrimary}`} className={footerLinkClass}>
                  {siteContact.emailPrimary}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <Phone size={17} aria-hidden />
                </span>
                <span className="font-sans text-base leading-snug text-white/70">
                  <a href={`tel:${siteContact.phoneTelPrimary}`} className={footerLinkClass}>
                    {siteContact.phoneDisplayPrimary}
                  </a>
                  {siteContact.phoneDisplaySecondary && (
                    <>
                      <br />
                      <a
                        href={`tel:${siteContact.phoneTelSecondary}`}
                        className={footerLinkClass}
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

        <NewsletterSignup />

        <div className="mt-12 border-t border-white/15 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="font-sans text-sm text-white/60">
              © {currentYear} JNVTAA — Jawahar Navodaya Vidyalaya
              Thiruvananthapuram Alumni Association.
            </p>
            <p className="font-sans text-sm text-white/60">
              Together for Navodaya · alumni-first
            </p>
          </div>
          <p className="mt-4 text-center font-sans text-xs text-white/45 md:text-left">
            Developed by alumni Ashin Amanulla —{" "}
            <a
              href="https://xyvin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-white/80"
            >
              xyvin.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
