import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugifyGalleryName } from "@/utils/gallerySlug";

export default function RenameGalleryDialog({
  open,
  onOpenChange,
  gallery,
  onConfirm,
  isPending = false,
}) {
  const [step, setStep] = useState(1);
  const [newName, setNewName] = useState("");

  const currentSlug = gallery?.slug || "";
  const imageCount = gallery?.imageCount ?? 0;

  const newSlug = useMemo(() => slugifyGalleryName(newName), [newName]);
  const isUnchanged = !newSlug || newSlug === currentSlug;
  const canContinue = newName.trim().length >= 2 && !isUnchanged;

  useEffect(() => {
    if (open && gallery) {
      setNewName(gallery.name || gallery.slug || "");
      setStep(1);
    }
    if (!open) {
      setStep(1);
      setNewName("");
    }
  }, [open, gallery]);

  const handleClose = (nextOpen) => {
    if (isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Rename gallery</DialogTitle>
              <DialogDescription>
                Images will be moved to a new S3 folder. The old folder will be
                deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rename-gallery-name">New gallery name</Label>
              <Input
                id="rename-gallery-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Alumni Meet 2026"
                disabled={isPending}
              />
              {newName.trim() && (
                <p className="text-sm text-muted-foreground">
                  S3 folder will become:{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {newSlug || "(invalid name)"}
                  </code>
                </p>
              )}
              {isUnchanged && newName.trim().length >= 2 && (
                <p className="text-sm text-destructive">
                  Choose a name that produces a different folder.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canContinue || isPending}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm rename</DialogTitle>
              <DialogDescription>
                Move {imageCount} image{imageCount !== 1 ? "s" : ""} from{" "}
                <strong>{currentSlug}</strong> to <strong>{newSlug}</strong> and
                delete the old folder?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => onConfirm?.({ newName: newName.trim(), newSlug })}
              >
                {isPending ? "Renaming…" : "Rename gallery"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
