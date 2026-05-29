import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ENV_KEYS = [
  { key: "VITE_API_URL", label: "API URL" },
  { key: "VITE_SITE_URL", label: "Site URL" },
  { key: "VITE_CONTACT_EMAIL", label: "Contact email" },
  { key: "VITE_CONTACT_PHONE", label: "Contact phone" },
  { key: "VITE_SOCIAL_INSTAGRAM", label: "Instagram" },
  { key: "VITE_SOCIAL_YOUTUBE", label: "YouTube" },
  { key: "VITE_SOCIAL_WHATSAPP", label: "WhatsApp" },
  { key: "VITE_GOOGLE_CLIENT_ID", label: "Google OAuth client ID" },
  { key: "VITE_RAZORPAY_KEY_ID", label: "Razorpay key ID" },
  { key: "VITE_MAP_TILES_URL", label: "Map tiles URL" },
];

export default function SettingsAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Environment-based configuration (read-only). Update values in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> and
          redeploy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frontend environment</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {ENV_KEYS.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-sm font-medium">{label}</dt>
                <dd className="break-all font-mono text-sm text-muted-foreground">
                  {import.meta.env[key] || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
