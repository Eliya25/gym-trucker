"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProgressPhoto } from "@/lib/types/domain";
import { deletePhoto, recordPhoto } from "@/lib/actions/photos";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmButton } from "@/components/ui/ConfirmButton";

const MAX_SIZE_MB = 10;

export function PhotoGallery({
  photos,
  signedUrls,
  userId,
}: {
  photos: ProgressPhoto[];
  signedUrls: Record<string, string>;
  userId: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("בחר תמונה קודם");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("אפשר להעלות רק קבצי תמונה");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`התמונה גדולה מדי (מקסימום ${MAX_SIZE_MB}MB)`);
      return;
    }
    setError(null);

    startUpload(async () => {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError("ההעלאה נכשלה: " + uploadError.message);
        return;
      }

      await recordPhoto(path, new Date().toLocaleDateString("sv-SE"));
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">תמונות התקדמות 📸</h1>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">העלאת תמונה</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="flex-1 text-sm text-zinc-400 file:ml-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-100 hover:file:bg-zinc-700"
          />
          <Button onClick={upload} disabled={isUploading}>
            {isUploading ? "מעלה..." : "⬆ העלה"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <p className="text-xs text-zinc-500">
          התמונות פרטיות לגמרי — רק אתה יכול לראות אותן.
        </p>
      </Card>

      {photos.length === 0 ? (
        <Card className="text-center text-zinc-500">
          עדיין אין תמונות. העלה תמונה ראשונה ותתחיל לתעד את השינוי!
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => {
            const url = signedUrls[photo.storage_path];
            return (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`תמונת התקדמות מ-${photo.taken_on}`}
                    className="aspect-[3/4] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center text-xs text-zinc-500">
                    לא נטען
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6 text-xs">
                  <span>
                    {new Date(photo.taken_on).toLocaleDateString("he-IL")}
                  </span>
                  <ConfirmButton
                    confirmText="למחוק את התמונה הזאת לצמיתות?"
                    action={deletePhoto.bind(
                      null,
                      photo.id,
                      photo.storage_path
                    )}
                    className="!px-1.5 !py-0.5 !text-xs"
                  >
                    ✕
                  </ConfirmButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
