import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DeleteGalleryDialog({
  open,
  onOpenChange,
  gallery,
  onConfirm,
  isPending = false,
}) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState("");

  const name = gallery?.name || gallery?.slug || "";
  const imageCount = gallery?.imageCount ?? 0;
  const canDelete = confirmText === name;

  useEffect(() => {
    if (!open) {
      setStep(1);
      setConfirmText("");
    }
  }, [open]);

  const handleClose = (nextOpen) => {
    if (isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        {step === 1 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to delete <strong>{name}</strong>, which contains{" "}
                {imageCount} image{imageCount !== 1 ? "s" : ""}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>This cannot be undone</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all {imageCount} image
                {imageCount !== 1 ? "s" : ""} from S3, including thumbnails.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
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
                variant="destructive"
                disabled={isPending}
                onClick={() => setStep(3)}
              >
                I understand, continue
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Type <strong>{name}</strong> below to permanently delete this
                gallery.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor="delete-gallery-confirm">Gallery name</Label>
              <Input
                id="delete-gallery-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={name}
                disabled={isPending}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!canDelete || isPending}
                onClick={() => onConfirm?.()}
              >
                {isPending ? "Deleting…" : "Delete gallery"}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
