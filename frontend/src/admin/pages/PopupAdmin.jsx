import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminSiteContentAPI } from "@/api/admin";
import ImageUploader from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { POPUP_DEFAULTS } from "@/constants/popup";

const POPUP_KEY = "popup";

export default function PopupAdmin() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(POPUP_DEFAULTS);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site-content", POPUP_KEY],
    queryFn: async () => {
      try {
        return await adminSiteContentAPI.getByKey(POPUP_KEY);
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    const popupData = data?.data?.content?.data;
    if (popupData) {
      setForm({ ...POPUP_DEFAULTS, ...popupData });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) => adminSiteContentAPI.upsert(POPUP_KEY, payload),
    onSuccess: () => {
      toast.success("Popup settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "site-content", POPUP_KEY] });
      queryClient.invalidateQueries({ queryKey: ["siteContent", POPUP_KEY] });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (form.enabled && !form.image) {
      toast.error("Add an image before turning the popup on");
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Site Popup</h1>
        <p className="text-sm text-muted-foreground">
          Show an occasional image popup to visitors on the public site. Turn it off when the
          announcement is over.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popup settings</CardTitle>
            <CardDescription>
              Upload an image and toggle visibility for all public pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="popup-enabled">Show popup on site</Label>
                    <p className="text-xs text-muted-foreground">
                      Visitors will see this popup when enabled.
                    </p>
                  </div>
                  <Switch
                    id="popup-enabled"
                    checked={form.enabled}
                    onCheckedChange={(checked) => updateField("enabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Popup image</Label>
                  <ImageUploader
                    value={form.image}
                    onChange={(url) => updateField("image", url)}
                    folder="popups"
                    label="Upload popup image"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popup-title">Title (optional)</Label>
                  <Input
                    id="popup-title"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Annual Reunion 2026"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popup-link">Link URL (optional)</Label>
                  <Input
                    id="popup-link"
                    type="url"
                    value={form.linkUrl}
                    onChange={(e) => updateField("linkUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="popup-link-label">Link button label</Label>
                  <Input
                    id="popup-link-label"
                    value={form.linkLabel}
                    onChange={(e) => updateField("linkLabel", e.target.value)}
                    placeholder="Learn more"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="popup-show-once">Show once per visit</Label>
                    <p className="text-xs text-muted-foreground">
                      Hide after dismiss until the browser tab is closed.
                    </p>
                  </div>
                  <Switch
                    id="popup-show-once"
                    checked={form.showOnce}
                    onCheckedChange={(checked) => updateField("showOnce", checked)}
                  />
                </div>

                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  Save popup
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How the popup will appear to visitors.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/30 p-4">
              {form.image ? (
                <div className="overflow-hidden rounded-md border bg-background">
                  <img
                    src={form.image}
                    alt={form.title || "Popup preview"}
                    className="max-h-80 w-full object-contain"
                  />
                  {(form.title || form.linkUrl) && (
                    <div className="space-y-3 p-4">
                      {form.title && (
                        <p className="text-center font-medium">{form.title}</p>
                      )}
                      {form.linkUrl && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={form.linkUrl} target="_blank" rel="noopener noreferrer">
                            {form.linkLabel || "Learn more"}
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Upload an image to preview the popup.
                </p>
              )}
              {!form.enabled && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Popup is currently off — enable it to show on the site.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
