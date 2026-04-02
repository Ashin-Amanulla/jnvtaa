import {
  Globe,
  Send,
  Users,
  Camera,
  Share2,
  Video,
  MessageCircle,
} from "lucide-react";

const env = import.meta.env;

function str(key, fallback = "") {
  const v = env[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
}

/** Public contact details for the sketch UI (defaults = current jnvtaa copy). */
export const siteContact = {
  addressLine1: str("VITE_SITE_ADDRESS_LINE_1", "JNV Trivandrum"),
  addressLine2: str("VITE_SITE_ADDRESS_LINE_2", "Thiruvananthapuram, Kerala, India"),
  emailPrimary: str("VITE_CONTACT_EMAIL", "info@jnvtaa.in"),
  emailSecondary: str("VITE_CONTACT_EMAIL_SECONDARY", ""),
  phoneDisplayPrimary: str("VITE_CONTACT_PHONE", "+91 98765 43210"),
  phoneDisplaySecondary: str("VITE_CONTACT_PHONE_SECONDARY", "+91 98765 43211"),
  /** E.164 without spaces for tel: links */
  phoneTelPrimary: str("VITE_CONTACT_PHONE_TEL", "+919876543210"),
  phoneTelSecondary: str("VITE_CONTACT_PHONE_TEL_SECONDARY", "+919876543211"),
};

export const siteUrls = {
  site: str("VITE_SITE_URL", ""),
  instagram: str("VITE_SOCIAL_INSTAGRAM", ""),
  youtube: str("VITE_SOCIAL_YOUTUBE", ""),
  whatsapp: str("VITE_SOCIAL_WHATSAPP", ""),
  telegram: str("VITE_SOCIAL_TELEGRAM", ""),
};

/**
 * Footer / Contact social row: real URLs from env when set, else sketch placeholders.
 */
export function getSocialNavLinks() {
  const out = [];
  if (siteUrls.site)
    out.push({ icon: Globe, href: siteUrls.site, label: "Website" });
  if (siteUrls.telegram)
    out.push({ icon: Send, href: siteUrls.telegram, label: "Telegram" });
  if (siteUrls.whatsapp)
    out.push({
      icon: MessageCircle,
      href: siteUrls.whatsapp,
      label: "WhatsApp",
    });
  if (siteUrls.instagram)
    out.push({ icon: Share2, href: siteUrls.instagram, label: "Instagram" });
  if (siteUrls.youtube)
    out.push({ icon: Video, href: siteUrls.youtube, label: "YouTube" });

  if (out.length > 0) return out;

  return [
    { icon: Globe, href: "#", label: "Web" },
    { icon: Send, href: "#", label: "Telegram" },
    { icon: Users, href: "#", label: "Community" },
    { icon: Camera, href: "/gallery", label: "Photos" },
  ];
}

export function formatVisitBlock() {
  return `${siteContact.addressLine1}\n${siteContact.addressLine2}`;
}

export function formatEmailBlock() {
  const lines = [siteContact.emailPrimary];
  if (siteContact.emailSecondary) lines.push(siteContact.emailSecondary);
  return lines.join("\n");
}

export function formatPhoneBlock() {
  const lines = [siteContact.phoneDisplayPrimary];
  if (siteContact.phoneDisplaySecondary) lines.push(siteContact.phoneDisplaySecondary);
  return lines.join("\n");
}
