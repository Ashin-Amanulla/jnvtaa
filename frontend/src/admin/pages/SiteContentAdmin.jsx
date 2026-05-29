import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminSiteContentAPI } from "@/api/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTENT_KEYS = [
  "home",
  "about",
  "leadership",
  "featuredAlumni",
  "testimonials",
  "footer",
  "settings",
];

export default function SiteContentAdmin() {
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState("home");
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site-content"],
    queryFn: () => adminSiteContentAPI.getAll(),
  });

  const contents = data?.data?.contents ?? [];
  const contentMap = Object.fromEntries(contents.map((c) => [c.key, c]));

  useEffect(() => {
    const content = contentMap[activeKey];
    setJsonText(
      content?.data ? JSON.stringify(content.data, null, 2) : "{\n  \n}"
    );
    setParseError("");
  }, [activeKey, data]);

  const saveMutation = useMutation({
    mutationFn: ({ key, parsed }) => adminSiteContentAPI.upsert(key, parsed),
    onSuccess: () => {
      toast.success("Content saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "site-content"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setParseError("");
      saveMutation.mutate({ key: activeKey, parsed });
    } catch {
      setParseError("Invalid JSON — fix syntax before saving.");
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Site Content</h1>
        <p className="text-sm text-muted-foreground">
          Edit CMS content blocks stored in the database.
        </p>
      </div>

      <Tabs value={activeKey} onValueChange={setActiveKey}>
        <TabsList className="flex h-auto flex-wrap">
          {CONTENT_KEYS.map((key) => (
            <TabsTrigger key={key} value={key} className="capitalize">
              {key}
            </TabsTrigger>
          ))}
        </TabsList>

        {CONTENT_KEYS.map((key) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                {contentMap[key]?.updatedBy && (
                  <p className="text-xs text-muted-foreground">
                    Last updated by {contentMap[key].updatedBy.firstName}{" "}
                    {contentMap[key].updatedBy.lastName}
                  </p>
                )}
                <div className="grid gap-2">
                  <Label htmlFor={`content-${key}`}>JSON data</Label>
                  <Textarea
                    id={`content-${key}`}
                    className="min-h-[400px] font-mono text-sm"
                    value={activeKey === key ? jsonText : ""}
                    onChange={(e) => {
                      setJsonText(e.target.value);
                      setParseError("");
                    }}
                  />
                  {parseError && (
                    <p className="text-sm text-destructive">{parseError}</p>
                  )}
                </div>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  Save {key}
                </Button>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
