import { createClient } from "@/lib/supabase/server";
import type { ProgressPhoto } from "@/lib/types/domain";
import { PhotoGallery } from "@/components/photos/PhotoGallery";

export default async function PhotosPage() {
  const supabase = await createClient();

  const [{ data: photos }, { data: userData }] = await Promise.all([
    supabase
      .from("progress_photos")
      .select("*")
      .order("taken_on", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const rows = (photos ?? []) as ProgressPhoto[];

  // private bucket → short-lived signed URLs for display
  let signedUrls: Record<string, string> = {};
  if (rows.length > 0) {
    const { data: signed } = await supabase.storage
      .from("progress-photos")
      .createSignedUrls(
        rows.map((p) => p.storage_path),
        60 * 60 // one hour
      );
    signedUrls = Object.fromEntries(
      (signed ?? [])
        .filter(
          (s): s is typeof s & { path: string; signedUrl: string } =>
            Boolean(s.signedUrl && s.path)
        )
        .map((s) => [s.path, s.signedUrl])
    );
  }

  return (
    <PhotoGallery
      photos={rows}
      signedUrls={signedUrls}
      userId={userData.user?.id ?? ""}
    />
  );
}
