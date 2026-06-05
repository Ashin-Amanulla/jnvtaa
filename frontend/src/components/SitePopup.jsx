import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/api/siteContent";
import { QUERY_KEYS, STALE_TIME } from "@/api/queryKeys";
import { POPUP_DEFAULTS } from "@/constants/popup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const POPUP_KEY = "popup";

function getDismissKey(updatedAt) {
  return `jnvtaa-popup-dismissed-${updatedAt || "default"}`;
}

export default function SitePopup() {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: QUERY_KEYS.siteContent(POPUP_KEY),
    queryFn: async () => {
      try {
        return await getSiteContent(POPUP_KEY);
      } catch {
        return null;
      }
    },
    staleTime: STALE_TIME.SITE_CONTENT,
  });

  const popup = { ...POPUP_DEFAULTS, ...data?.data?.content?.data };
  const updatedAt = data?.data?.content?.updatedAt;

  useEffect(() => {
    if (!popup.enabled || !popup.image) {
      setOpen(false);
      return;
    }

    if (popup.showOnce) {
      const dismissKey = getDismissKey(updatedAt);
      if (sessionStorage.getItem(dismissKey) === "1") {
        setOpen(false);
        return;
      }
    }

    setOpen(true);
  }, [popup.enabled, popup.image, popup.showOnce, updatedAt]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && popup.showOnce) {
      sessionStorage.setItem(getDismissKey(updatedAt), "1");
    }
    setOpen(nextOpen);
  };

  if (!popup.enabled || !popup.image) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {popup.title && (
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{popup.title}</DialogTitle>
          </DialogHeader>
        )}

        <div className={popup.title ? "px-6 pb-2" : "pt-6"}>
          {popup.linkUrl ? (
            <a
              href={popup.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={popup.image}
                alt={popup.title || "Announcement"}
                className="max-h-[70vh] w-full object-contain"
              />
            </a>
          ) : (
            <img
              src={popup.image}
              alt={popup.title || "Announcement"}
              className="max-h-[70vh] w-full object-contain"
            />
          )}
        </div>

        {popup.linkUrl && (
          <div className="px-6 pb-6 pt-4">
            <Button className="w-full" asChild>
              <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer">
                {popup.linkLabel || "Learn more"}
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
